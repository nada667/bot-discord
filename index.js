const badWords = [
  "pute", "connard", "salope", "fdp",
  "fuck", "shit", "bitch", "asshole",
  "hmar", "klb", "zbi", "9hab", "zaml",
  "scheisse", "arschloch", "hurensohn",
  "puta", "mierda", "gilipollas",
  "orospu", "amk", "salak","ntm","tg","ftg","mok","97ba","9lawi","nam","ptn","3zwa","negero","l7wa","9ouwd","b9","w9","t9awd"
  ];
  function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require("discord.js");
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔴 ID du serveur (important)
const GUILD_ID = "1487893628729823465";

client.once("ready", async () => {
  console.log("Bot FULL PRO MAX 🔥");

  // 🔧 Créer commandes slash
  await client.application.commands.set([
    {
      name: "ping",
      description: "Test du bot"
    },
    {
      name: "ticket",
      description: "Créer un ticket support"
    }
  ], GUILD_ID);
});

// ⚡ COMMANDES SLASH
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // 🏓 Ping
  if (interaction.commandName === "ping") {
    return interaction.reply("pong 🏓");
  }

  // 🎫 Ticket
  if (interaction.commandName === "ticket") {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    await channel.send(`🎫 Ticket ouvert par ${interaction.user}`);
    interaction.reply({ content: "✅ Ticket créé !", ephemeral: true });
});    
  }
});
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  console.log("MESSAGE REÇU :", message.content);

  message.channel.send("Je vois ton message 👀");
});
client.login(process.env.TOKEN);
