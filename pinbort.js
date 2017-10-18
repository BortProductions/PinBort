const Discord = require("discord.js");
const client = new Discord.Client();
const token = "put your token here";

client.on('ready', () => {
  console.log(`PinBort is now up as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.startsWith('*')) {
    if (msg.content == "*help")
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
  }
});

client.login(token);
