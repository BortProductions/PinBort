const Discord = require("discord.js");
const client = new Discord.Client();

const fs = require("fs");

const channelRegex = /([0-9]+)(?=>)/g;
const numberRegex = /[0-9]+/g;

const sql3 = require("sqlite3").verbose();
const db = new sql3.Database("./users.sqlite");

const Perms = require("./perms.js");

client.on('ready', () => {
    console.log(`PinBort is now up as ${client.user.tag}! ${client.guilds.array().length} guilds.`);
    client.user.setGame("and pinning");
    client.user.setStatus("idle");
});

client.on('message', msg => {
    Perms.getPrefix(msg.guild, db, prefix => {
        if (msg.content.startsWith(prefix) || (msg.mentions.members.first() && msg.mentions.members.first().id === client.user.id)) {
            let command;
            if(msg.content.startsWith(prefix)){
                command = msg.content.substring(prefix.length)
            }
            else{
                command = msg.content.substring(client.user.id.length + 3).replace(/^\s+|\s+$/g, "");
            }
            console.log("Command: \"" + command + "\"");

            if (command === "help") {
                msg.channel.send({
                    embed: {
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
            if (command === "pin") {
                sql.get(`SELECT * FROM users WHERE userId = "${msg.author.id}"`).then(row => {

                }).catch(() => {
                    console.error; // Gotta log those errors
                    sql.run("CREATE TABLE IF NOT EXISTS users (userId TEXT, server TEXT)").then(() => {
                        sql.run("INSERT INTO users (userId, server) VALUES (?, ?, ?)", [1, 1]);
                    });
                });
            }
            if (command.startsWith("allow")) {
                Perms.effectivelyAllowed(msg.author, msg.guild, db, (isAllowed) => {
                    if (isAllowed) {
                        if (msg.mentions.users.array().length > 0) {
                            Perms.addAllowed(msg.mentions.users.array()[0], msg.guild, db);
                            msg.channel.send(`Gave **${msg.mentions.users.array()[0].username}** permission to pin messages.`);
                        }
                        else {
                            msg.channel.send("Not enough args.");
                        }
                    }
                    else {
                        msg.channel.send("You do not have enough permissions to execute this command.");
                    }
                });
            }
            if (command.startsWith("deny")) {
                Perms.effectivelyAllowed(msg.author, msg.guild, db, (isAllowed) => {
                    if (isAllowed) {
                        if (msg.mentions.users.array().length > 0) {
                            Perms.removeAllowed(msg.mentions.users.array()[0], msg.guild, db);
                            msg.channel.send(`Removed **${msg.mentions.users.array()[0].name}**'s permissions to pin messages.`);
                        }
                        else {
                            msg.channel.send("Not enough args.");
                        }
                    }
                    else {
                        msg.channel.send("You do not have enough permissions to execute this command.");
                    }
                });
            }
            if (command === "testperms") {
                Perms.effectivelyAllowed(msg.author, msg.guild, db, isAllowed => {
                    msg.channel.send(`Do you have perms to pin messages? ${isAllowed}`)
                });
            }
            if (command.startsWith("channel")) {
                Perms.effectivelyAllowed(msg.author, msg.guild, db, isAllowed => {
                    if (isAllowed) {
                        if (command.split(" ").length > 1) {
                            let data = [];
                            if ((data = channelRegex.exec(command.split(" ")[1])) !== null) {
                                Perms.setChannel(data[0], msg.guild, db);
                                msg.channel.send("Successfully set channel to: " + command.split(" ")[1]);
                            }
                            else {
                                Perms.setChannel(command.split(" ")[1], msg.guild, db);
                                msg.channel.send("Successfully set channel to: " + command.split(" ")[1]);
                            }
                        }
                        else {
                            Perms.getChannel(msg.guild, db, channel => {
                                if (numberRegex.exec(channel) !== null) {
                                    msg.channel.send("Pinning channel: <#" + channel + ">");
                                }
                                else {
                                    msg.channel.send("Pinning channel: " + channel);
                                }
                            });
                        }
                    }
                    else {
                        msg.channel.send("You do not have enough permissions to execute this command.");
                    }
                })

            }
            if(command.startsWith("prefix")){
                Perms.effectivelyAllowed(msg.author, msg.guild, db, isAllowed => {
                    if(isAllowed){
                        if(command.split(" ").length > 1){
                            Perms.setPrefix(command.split(" ")[1], msg.guild, db);
                            msg.channel.send(`Successfully set prefix to **${command.split(" ")[1]}**`);
                        }
                        else{
                            msg.channel.send(`Prefix: ${prefix}`);
                        }
                    }
                    else{
                        msg.channel.send("You do not have enough permissions to execute this command");
                    }
                })
            }
        }
    });
});

fs.readFile('token', 'utf8', function (err, data){
    if(err){
        return console.log(err);
    }
    client.login(data);
});
