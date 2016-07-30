# Discord RPBot
[![Discord](https://discordapp.com/api/servers/204792270568816640/widget.png)](https://discord.gg/SZMhh2B)
[![Downloads](https://img.shields.io/npm/dt/discord-rpbot.svg)](https://www.npmjs.com/package/discord-rpbot)
[![Version](https://img.shields.io/npm/v/discord-rpbot.svg)](https://www.npmjs.com/package/discord-rpbot)
[![Dependency status](https://david-dm.org/Gawdl3y/discord-rpbot.svg)](https://david-dm.org/Gawdl3y/discord-rpbot)
[![License](https://img.shields.io/npm/l/discord-rpbot.svg)](LICENSE)

This is a simple Discord bot that contains commands useful for roleplaying.
It is written in ECMAScript 6 using Babel, and is built with [discord.js](https://github.com/hydrabolt/discord.js) and Node.js.

Have any questions/feedback?
Join the [Discord server](https://discord.gg/SZMhh2B).
If you find any bugs or have suggestions, feel free to [create an issue](/../../issues).

## Install
### Global bot
[Add the bot to your server](https://discordapp.com/oauth2/authorize?client_id=204353188172660747&scope=bot&permissions=0)

### Your own instance
You must be running Node.js 6.0.0 or newer.  
Run `sudo npm install -g discord-rpbot --no-optional`.

**Note:** Anonymous analytics are enabled by default.
There is no identifiable or potentially private/unsafe information sent whatsoever.
The only things that are being shared is the name of commands being run (no message contents), and an event for the bot starting up.
This is so that I know how many people are using the bot, and what commands are being used the most.
If you don't want anything being sent at all, use the `analytics` configuration option.

## Chat commands
| Command          | Description                                                                                                   |
|------------------|---------------------------------------------------------------------------------------------------------------|
| help             | Displays a list of available commands, or detailed information for a specified command.                       |
| about            | Displays information about the bot.                                                                           |
| prefix           | Shows or sets the command prefix.                                                                             |
| roll             | Rolls specified dice. (Uses [dice-expression-evaluator](https://github.com/dbkang/dice-expression-evaluator)) |
| maxroll          | Calculates the maximum possible roll for a dice expression.                                                   |
| minroll          | Calculates the minimum possible roll for a dice expression.                                                   |
| character        | Views a character's information.                                                                              |
| characters       | Lists/searches characters in the database.                                                                    |
| addcharacter     | Adds a character to the database, or updates the existing one.                                                |
| deletecharacter  | Deletes a character from the database.                                                                        |
| roles            | Lists all server roles. (administrator only)                                                                  |
| modroles         | Lists all moderator roles. (administrator only)                                                               |
| addmodrole       | Adds a moderator role. (administrator only)                                                                   |
| deletemodrole    | Deletes a moderator role. (administrator only)                                                                |

You may use a command by prefixing it with the command prefix (default `!`) or the bot's mention (e.g. `@RPBot#4161`).
Use `!help` or `@RPBot#4161 help`, for example.
The prefix is configurable on a server-by-server basis, with the `prefix` command.
You may DM the bot for many commands.

Characters in the database may only be updated/deleted by the owner of the character, and moderators.
If a user has the "administrator" permission, they are automatically considered a moderator.
If there aren't any mod roles set, users with the "manage messages" permission are considered a moderator.
Otherwise, users will be considered a moderator if they have one of the moderator roles.

## Configure
Configuration can be specified on the command line, or in a JSON or YAML config file.
Specify the config file with `--config=(FILE PATH)`.
The settings:

| Setting              | Description                                                                      |        
|----------------------|----------------------------------------------------------------------------------|
| token                | API token for the bot account                                                    |
| email                | Email of the Discord account for the bot to use (not needed if using `token`)    |
| password             | Password of the Discord account for the bot to use (not needed if using `token`) |
| storage              | Path to the storage directory                                                    |
| auto-reconnect       | Whether or not the bot should automatically reconnect when disconnected          |
| owner                | Discord user ID of the bot owner                                                 |
| command-prefix       | Default command prefix (blank to use only mentions)                              |
| unknown-only-mention | Whether or not to output unknown command response only for mentions              |
| pagination-items     | Number of items per page in paginated commands                                   |
| update-check         | How frequently to check for an update (in minutes - use 0 to disable)            |
| analytics            | Whether or not to enable anonymous, non-unique, non-identifiable analytics       |
| log                  | Path to the log file to output to                                                |
| log-max-size         | Maximum size of a single log file (in bytes)                                     |
| log-max-files        | Maximum log files to keep                                                        |
| log-level            | Log level to output to the log file (error, warn, info, verbose, debug)          |
| console-level        | Log level to output to the console (error, warn, info, verbose, debug)           |

## Usage
Run `rpbot` on the command-line.
Use `rpbot --help` for information.
