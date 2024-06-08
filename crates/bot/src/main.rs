use std::net::SocketAddr;

use clap::Parser;
use dotenv::dotenv;
use secrecy::Secret;
use tracing_forest::{traits::*, util::*};

use rpbot_db as db;

mod bot;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Config {
	/// Host & port of the database server
	#[arg(long, short = 'a', env("RPBOT_DB"), default_value = "127.0.0.1:8000")]
	pub db_address: SocketAddr,

	/// Username for authenticating with the database server
	#[arg(long, short = 'u', env("RPBOT_DB_USER"), requires = "db_pass")]
	pub db_user: Option<String>,

	/// Password for authenticating with the database server
	#[arg(long, short = 'p', env("RPBOT_DB_PASS"))]
	pub db_pass: Option<Secret<String>>,

	/// Namespace of the database to use
	#[arg(long, short = 'n', env("RPBOT_DB_NAMESPACE"), default_value = "rpbot")]
	pub db_namespace: String,

	/// Database to use for storing/retrieving data
	#[arg(long, short = 'd', env("RPBOT_DB_NAME"), default_value = "rpbot")]
	pub db_name: String,

	/// Discord bot token
	#[arg(long, short = 't', env("RPBOT_TOKEN"))]
	pub token: Secret<String>,
}

impl Config {
	#[tracing::instrument("Loading configuration", level = "info")]
	pub fn load() -> Result<Self, anyhow::Error> {
		dotenv()
			.map(|path| {
				info!(path = %path.display(), "Processed .env file");
			})
			.or_else(|err| {
				if err.not_found() {
					info!("No .env file to load");
					Ok(())
				} else {
					Err(err)
				}
			})?;

		let cfg = Self::parse();
		info!(config = ?cfg, "Done loading");

		Ok(cfg)
	}
}

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
	tracing_forest::worker_task()
		.map_sender(|sender| sender)
		.map_receiver(|printer| printer)
		.build_on(|subscriber| {
			subscriber.with(EnvFilter::try_from_default_env().unwrap_or_else(|_| {
				"warn,discord_rpbot=info,rpbot_db=info"
					.parse()
					.expect("Unable to parse default EnvFilter string")
			}))
		})
		.on(async {
			info!("Starting RPBot");
			let cfg = Config::load()?;

			let db_cfg = db::Config {
				addr: cfg.db_address,
				auth: cfg.db_user.map(|user| db::Auth {
					user,
					pass: cfg.db_pass.unwrap(),
				}),
				ns: cfg.db_namespace,
				db: cfg.db_name,
			};
			let pool = init_db_pool(db_cfg).await?;

			info!("Running Discord bot");
			bot::run(pool, cfg.token).await?;

			Ok::<_, anyhow::Error>(())
		})
		.await
}

#[tracing::instrument("Setting up database connection pool", level = "info")]
async fn init_db_pool(config: db::Config) -> Result<db::Pool, anyhow::Error> {
	let manager = db::Manager::new(config);
	let pool = db::Pool::builder(manager).max_size(10).build()?;
	let _ = pool.get().await?;
	Ok(pool)
}
