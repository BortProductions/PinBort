const Discord = require("discord.js");
const client = new Discord.Client();

const fs = require("fs");

const sql = require("sqlite");
sql.open("./users.sqlite");

const Perms = require("./perms.js");

client.on('ready', () => {
    console.log(`PinBort is now up as ${client.user.tag}! ${client.guilds.array().length} guilds.`);
    client.user.setGame("and pinning");
    client.user.setStatus("idle");
});

client.on('message', msg => {
    if (msg.content.startsWith('*')) {
        if (msg.content === "*help")
        {
            msg.channel.send({embed: {
                color: 3447003,
                author: {name: "PinBort help"},
                description: "PinBort is a bot designed to ''pin'' the best quotes from your server into a channel.",
                fields: [{
                    name: "To pin a message, use the :pushpin: reaction",
                    value: "Here are additional bot commands below:"
                },
                    {
                        name: "*help",
                        value: "Gee I fucking wonder :thinking:"
                    },
                    {
                        name: "*pin",
                        value: "Pins a message from ID, if the reaction is not working. **You will need developer mode for this**"
                    },
                    {
                        name: "*allow",
                        value: "This allows certain people to pin. **People with Manage Messages can allow/deny people and can pin regardless of this**"
                    },
                    {
                        name: "*deny",
                        value: "Opposite of allow, same permissions are true"
                    }
                ],
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "© Bort Industries, Naleksuh and GamingAndStuffs 2017"
                }
            }
            });
        }
        if (msg.content === "*pin")
        {
            sql.get(`SELECT * FROM users WHERE userId = "${msg.author.id}"`).then(row => {

            }).catch(() => {
                console.error; // Gotta log those errors
                sql.run("CREATE TABLE IF NOT EXISTS users (userId TEXT, server TEXT)").then(() => {
                    sql.run("INSERT INTO users (userId, server) VALUES (?, ?, ?)", [1, 1]);
                });
            });
        }
        if (msg.content.startsWith("*allow"))
        {
            if(Perms.effectivelyAllowed(msg.author, msg.guild, sql)){
                if(msg.mentions.users.array().length > 0){
                    Perms.addAllowed(msg.mentions.users.array()[0], msg.guild, sql);
                    msg.channel.send(`Gave **${msg.mentions.users.array()[0].username}** permission to pin messages.`);
                }
                else {
                    msg.channel.send("Not enough args.");
                }
            }
            else {
                msg.channel.send("You do not have enough permissions to execute this command.");
            }
        }
        if (msg.content.startsWith("*deny"))
        {
            if(Perms.effectivelyAllowed(msg.author, msg.guild)){
                if(msg.mentions.users.array().length > 0){
                    Perms.removeAllowed(msg.mentions.users.array()[0], msg.guild, sql);
                    msg.channel.send(`Removed **${msg.mentions.users.array()[0].name}**'s permissions to pin messages.`);
                }
                else {
                    msg.channel.send("Not enough args.");
                }
            }
            else {
                msg.channel.send("You do not have enough permissions to execute this command.");
            }
        }
        if (msg.content === "*testperms")
        {
            msg.channel.send(`Do you have perms to pin messages? ${Perms.effectivelyAllowed(msg.author, msg.guild, sql)}`)
        }
    }
});

fs.readFile('token', 'utf8', function (err, data){
    if(err){
        return console.log(err);
    }
    client.login(data);
});
