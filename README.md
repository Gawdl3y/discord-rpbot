# Discord RPBot
[![Discord](https://discordapp.com/api/servers/204792270568816640/widget.png)](https://discord.gg/SZMhh2B)
[![Downloads](https://img.shields.io/npm/dt/discord-rpbot.svg)](https://www.npmjs.com/package/discord-rpbot)
[![Version](https://img.shields.io/npm/v/discord-rpbot.svg)](https://www.npmjs.com/package/discord-rpbot)
[![Dependency status](https://david-dm.org/Gawdl3y/discord-rpbot.svg)](https://david-dm.org/Gawdl3y/discord-rpbot)
[![License](https://img.shields.io/npm/l/discord-rpbot.svg)](LICENSE)

This is a simple Discord bot that contains commands useful for roleplaying.
It is written in ECMAScript 6 using Babel, and is built with [discord.js](https://github.com/hydrabolt/discord.js) and Node.js.

[Discord server](https://discord.gg/SZMhh2B)

## Install
### Global bot
[Add the bot to your server](https://discordapp.com/oauth2/authorize?client_id=204353188172660747&scope=bot&permissions=0)

### Your own instance
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
| storage        | Path to the storage directory                                                    |
| auto-reconnect | Whether or not the bot should automatically reconnect when disconnected          |
| log            | Path to the log file to output to                                                |
| log-max-size   | Maximum size of a single log file                                                |
| log-max-files  | Maximum log files to keep                                                        |
| log-level      | Log level to output to the log file (error, warn, info, verbose, debug)          |
| console-level  | Log level to output to the console (error, warn, info, verbose, debug)           |

## Usage
Run `rpbot` on the command-line.
Use `rpbot --help` for information.

## Commands
| Command           | Description                                                                                                   |
|-------------------|---------------------------------------------------------------------------------------------------------------|
| !help             | Displays a list of available commands, or detailed information for a specified command.                       |
| !about            | Displays information about the bot                                                                            |
| !roll             | Rolls specified dice. (Uses [dice-expression-evaluator](https://github.com/dbkang/dice-expression-evaluator)) |
| !maxroll          | Calculates the maximum possible roll for a dice expression.                                                   |
| !minroll          | Calculates the minimum possible roll for a dice expression.                                                   |
| !character        | View a character's information.                                                                               |
| !characters       | Lists all of the characters in the database.                                                                  |
| !addcharacter     | Adds a character to the database.                                                                             |
| !deletecharacter  | Deletes a character from the database.                                                                        |
