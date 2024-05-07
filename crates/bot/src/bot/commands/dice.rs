use tyche::{dice::roller::FastRand as FastRandRoller, Expr};

use super::super::{Context, Error};

/// Rolls dice!
#[poise::command(slash_command)]
pub async fn roll(
	ctx: Context<'_>,
	#[description = "Dice expression"]
	#[rename = "dice"]
	#[max_length = 500]
	expr: Option<Expr>,
) -> Result<(), Error> {
	let seed = ctx.created_at().timestamp_millis().unsigned_abs();
	let mut roller = FastRandRoller::with_seed(seed);

	let expr = expr.unwrap_or_else(|| Expr::Dice(Default::default()));
	let evaled = expr.eval(&mut roller)?;
	let total = evaled.calc()?;

	ctx.say(format!("Rolled **{total}**: {evaled}")).await?;

	Ok(())
}
