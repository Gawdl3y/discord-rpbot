# Discord RPBot
[![Downloads](https://img.shields.io/npm/dt/discord-rpbot.svg)](https://www.npmjs.com/package/discord-rpbot)
[![Version](https://img.shields.io/npm/v/discord-rpbot.svg)](https://www.npmjs.com/package/discord-rpbot)
[![Dependency status](https://david-dm.org/Gawdl3y/discord-rpbot.svg)](https://david-dm.org/Gawdl3y/discord-rpbot)
[![License](https://img.shields.io/npm/l/discord-rpbot.svg)](LICENSE)

This is a simple Discord bot that contains commands useful for roleplaying.
It is written in ECMAScript 6 using Babel, and is built with [discord.js](https://github.com/hydrabolt/discord.js) and Node.js.

## Install
You must be running Node.js 6.0.0 or newer.  
Run `sudo npm install -g discord-rpbot --no-optional`.

## Configure
Configuration can be specified on the command line, or in a JSON or YAML config file.
Specify the config file with `--config=(FILE PATH)`.
The settings:

| Setting        | Description                                                                      |        
|----------------|----------------------------------------------------------------------------------|
| token          | API token for the bot account                                                    |
| email          | Email of the Discord account for the bot to use (not needed if using `token`)    |
| password       | Password of the Discord account for the bot to use (not needed if using `token`) |
| auto-reconnect | Whether or not the bot should automatically reconnect when disconnected          |
| log            | Path to the log file to output to                                                |
| log-level      | Log level to output to the log file (error, warn, info, verbose, debug)          |
| console-level  | Log level to output to the console (error, warn, info, verbose, debug)           |

## Usage
Run `rpbot` on the command-line.
Use `rpbot --help` for information.

## Commands
| Command    | Description                                                                                                            |
|------------|------------------------------------------------------------------------------------------------------------------------|
| !help      | Displays a list of available commands, or detailed information for a specified command.                                |
| !about     | Displays information about the bot                                                                                     |
| !roll      | Rolls specified dice. (Uses [dice-expression-evaluator](https://github.com/dbkang/dice-expression-evaluator))          |
| !maxroll   | Calculates the maximum possible roll for a dice expression.                                                            |
| !minroll   | Calculates the minimum possible roll for a dice expression.                                                            |
| !test      | Does absolutely nothing useful.                                                                                        |
