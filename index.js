/**
 * @file Main file
 * @author Dutch
 * @version 1.2.0
 */

// Requirements
const { Client, Collection, Intents } = require("discord.js");
const mineflayer = require("mineflayer"); 
const fs = require("fs")
const yaml = require("js-yaml");
const chalk = require("chalk");

let config = yaml.load(fs.readFileSync(`${process.cwd()}/config.yml`, "utf8"));
const client = new Client({
    allowedMentions: { parse: ['users', 'roles'] },
    fetchAllMembers: false,
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS ],
});

client.slash = new Collection();
client.commands = new Collection();
client.aliases = new Collection();
client.onlineBots = [];
client.bots = [];

// creating the bots 
function createBots () { 
    for (eachAlt of config.alts) {
        
        const part = eachAlt.split(":", 2);

        let bot;
            bot = mineflayer.createBot({
                username: part[0],
                password: part[1],
                host: config.minecraft.serverIP,
                port: config.minecraft.serverPort,
                version: config.minecraft.version,
                auth: config.minecraft.auth
        });

        bot.on("login", () => {
            // Without a check this will execute twice
            if(!client.onlineBots.includes(bot.username)) {
                bot.chat(config.minecraft.joinCommand);
                client.onlineBots.push(bot.username);
                client.bots.push(bot);
                console.log(chalk.green.bold(`[ALTS]: ${bot.username} logged in!`));
            };
        });

        bot.on("end", () => {
            console.log(chalk.red.bold(`[ALTS]: ${bot.username} logged off!`));
            client.onlineBots.splice(client.onlineBots.indexOf(bot.username), 1);
        });

        bot.on("death", () => {
            console.log(chalk.red.bold(`[ALTS]: ${bot.username} died! Respawning it..`));
        });

        bot.on("kicked", () => {
            console.log(chalk.red.bold(`[ALTS]: ${bot.username} got kicked! Relogging it..`));
        });

    };
};

createBots();

["commands", "events"].forEach(file => { require(`./src/utilities/handlers/${file}`)(client) } );

client.login(config.discord.botToken);