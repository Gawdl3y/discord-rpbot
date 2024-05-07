use poise::serenity_prelude as serenity;
use secrecy::{ExposeSecret, Secret};

use rpbot_db as db;

mod commands;

/// Data available across the Discord bot
struct Data {
	/// Database pool for storing/retrieving data
	db_pool: db::Pool,
}

/// Error type produced by commands
type Error = Box<dyn std::error::Error + Send + Sync>;

/// Context type for commands
type Context<'a> = poise::Context<'a, Data, Error>;

/// Runs the bot, whodathunkit?
pub async fn run(db_pool: db::Pool, token: Secret<String>) -> Result<(), anyhow::Error> {
	let framework = poise::Framework::builder()
		.options(poise::FrameworkOptions {
			commands: vec![commands::dice::roll()],
			..Default::default()
		})
		.setup(move |ctx, _ready, framework| {
			Box::pin(async move {
				poise::builtins::register_globally(ctx, &framework.options().commands).await?;
				Ok(Data { db_pool })
			})
		})
		.build();

	let intents = serenity::GatewayIntents::non_privileged();
	let mut client = serenity::ClientBuilder::new(token.expose_secret(), intents)
		.framework(framework)
		.await?;
	client.start().await?;

	Ok(())
}
