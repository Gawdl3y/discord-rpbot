# Discord RPBot
This is a simple bot that contains commands useful for roleplaying.
It is written in ECMAScript 6 using Babel, and uses Node.js.

## Usage
Clone the repository, and run `npm install --no-optional && npm run build` in it.
To run the bot, use `node lib/main.js`.

## Commands
| Command    | Description                                                                                                            |
|------------|------------------------------------------------------------------------------------------------------------------------|
| !help      | Displays a list of available commands, or detailed information for a specified command.                                |
| !roll      | Rolls specified dice. (Uses [dice-expression-evaluator](https://github.com/dbkang/dice-expression-evaluator))          |
| !maxroll   | Calculates the maximum possible roll for a dice expression.                                                            |
| !minroll   | Calculates the minimum possible roll for a dice expression.                                                            |
| !test      | Does absolutely nothing useful.                                                                                        |
