#![allow(clippy::tabs_in_doc_comments)]

//! Shared database-related code for discord-rpbot and its related crates

#![deny(macro_use_extern_crate, meta_variable_misuse, unit_bindings)]
#![warn(
	explicit_outlives_requirements,
	missing_docs,
	missing_debug_implementations,
	unreachable_pub,
	unused_crate_dependencies,
	unused_qualifications,
	clippy::pedantic,
	clippy::absolute_paths,
	clippy::arithmetic_side_effects,
	clippy::clone_on_ref_ptr,
	clippy::cognitive_complexity,
	clippy::empty_enum_variants_with_brackets,
	clippy::empty_structs_with_brackets,
	clippy::expect_used,
	clippy::filetype_is_file,
	clippy::missing_const_for_fn,
	clippy::fn_to_numeric_cast_any,
	clippy::format_push_string,
	clippy::get_unwrap,
	clippy::if_then_some_else_none,
	clippy::lossy_float_literal,
	clippy::map_err_ignore,
	clippy::missing_docs_in_private_items,
	clippy::multiple_inherent_impl,
	clippy::mutex_atomic,
	clippy::panic_in_result_fn,
	clippy::print_stderr,
	clippy::print_stdout,
	clippy::pub_without_shorthand,
	clippy::rc_buffer,
	clippy::rc_mutex,
	clippy::redundant_type_annotations,
	clippy::ref_patterns,
	clippy::rest_pat_in_fully_bound_structs,
	clippy::same_name_method,
	clippy::self_named_module_files,
	clippy::str_to_string,
	clippy::string_to_string,
	clippy::suspicious_xor_used_as_pow,
	clippy::tests_outside_test_module,
	clippy::try_err,
	clippy::undocumented_unsafe_blocks,
	clippy::unnecessary_safety_comment,
	clippy::unnecessary_safety_doc,
	clippy::unnecessary_self_imports,
	clippy::unneeded_field_pattern,
	clippy::unwrap_in_result,
	clippy::unwrap_used,
	clippy::verbose_file_reads
)]

use std::net::SocketAddr;

use deadpool::managed;
use secrecy::{ExposeSecret, Secret};
use surrealdb::{
	engine::remote::ws::{Client, Ws},
	opt::auth::Root,
	Surreal,
};
use tracing::info;

/// Database instance to store/retrieve all bot-related data
#[derive(Debug)]
pub struct Database {
	/// Connected Surreal client
	db: Surreal<Client>,
}

impl Database {
	/// Opens a connection to the database
	#[tracing::instrument("Database::open", level = "info")]
	pub async fn open(config: &Config) -> Result<Self, Error> {
		// Open a WebSocket connection to the SurrealDB instance
		info!(server = %config.addr, "Connecting to the SurrealDB server");
		let db = Surreal::new::<Ws>(config.addr).await?;
		info!("Connected");

		// Authenticate with the database server
		if let Some(auth) = &config.auth {
			info!(user = &auth.user, "Authenticating with the SurrealDB server");
			db.signin(Root {
				username: &auth.user,
				password: auth.pass.expose_secret(),
			})
			.await?;
			info!("Authenticated");
		}

		// Select the database to use
		info!(namespace = &config.ns, db = &config.db, "Selecting database");
		db.use_ns(&config.ns).use_db(&config.db).await?;
		info!("Database selected");

		Ok(Database { db })
	}
}

/// Database-related error
#[derive(thiserror::Error, Debug)]
pub enum Error {
	/// Error from a Surreal client
	#[error(transparent)]
	SurrealDb(#[from] surrealdb::Error),
}

/// Configuration for a database connection
#[derive(Debug, Clone)]
pub struct Config {
	/// Address of the Surreal server to connect to
	pub addr: SocketAddr,

	/// Credentials to authenticate to the server with
	pub auth: Option<Auth>,

	/// Namespace the database is in
	pub ns: String,

	/// Name of the database to use
	pub db: String,
}

/// Credentials to authenticate to a database server
#[derive(Debug, Clone)]
pub struct Auth {
	/// Username to authenticate as
	pub user: String,

	/// Password to authenticate with
	pub pass: Secret<String>,
}

/// Manager type for creating and recycling [`Database`]s
#[derive(Debug)]
pub struct Manager {
	/// Configuration for the database connections
	config: Config,
}

impl Manager {
	/// Creates a new manager for [`Database`]s with a given config used for connections
	#[must_use]
	pub const fn new(config: Config) -> Self {
		Manager { config }
	}
}

impl managed::Manager for Manager {
	type Type = Database;
	type Error = Error;

	async fn create(&self) -> Result<Database, Error> {
		let db = Database::open(&self.config).await?;
		Ok(db)
	}

	async fn recycle(&self, _: &mut Database, _: &managed::Metrics) -> managed::RecycleResult<Error> {
		Ok(())
	}
}

/// Connection pool of [`Database`]s
pub type Pool = managed::Pool<Manager>;
