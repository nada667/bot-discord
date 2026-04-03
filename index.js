const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField, 
  ChannelType 
} = require("discord.js");

// 🔴 CONFIG
const GUILD_ID = "1487893628729823465";

// 🧠 DATA
let warns = {};

// 🚫 LISTE INSULTES
const badWords = [
  "pute","connard","salope","fdp",
  "fuck","shit","bitch","asshole",
  "hmar","klb","zbi","9hab","zaml",
  "scheisse","arschloch","hurensohn",
  "puta","mierda","gilipollas",
  "orospu","amk","salak",
  "ntm","tg","ftg","mok","97ba","9lawi","nam","ptn","3zwa","l7wa","9ouwd","b9","w9","t9awd"
];

// 🔧 NORMALIZE
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
}

// 🤖 BOT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ✅ READY
client.once("ready", async () => {
  console.log("✅ Bot en ligne !");

  await client.application.commands.set([
    { name: "ping", description: "Test du bot" },
    { name: "ticket", description: "Créer un ticket" },

    {
      name: "warn",
      description: "Warn un membre",
      options: [{ name: "user", type: 6, required: true }]
    },

    {
      name: "ban",
      description: "Ban un membre",
      options: [{ name: "user", type: 6, required: true }]
    },

    {
      name: "kick",
      description: "Kick un membre",
      options: [{ name: "user", type: 6, required: true }]
    },

    {
      name: "mute",
      description: "Mute un membre (10 min)",
      options: [{ name: "user", type: 6, required: true }]
    }

  ], GUILD_ID);
});

// ⚡ COMMANDES
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {

    // 🏓 PING
    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong !");
    }

    // 🎫 TICKET
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
      return interaction.reply({ content: "✅ Ticket créé !", ephemeral: true });
    }

    // ⚠️ WARN
    if (interaction.commandName === "warn") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: "❌ Pas la permission", ephemeral: true });
      }

      const user = interaction.options.getUser("user");

      if (!warns[user.id]) warns[user.id] = 0;
      warns[user.id]++;

      return interaction.reply(`⚠️ ${user.tag} a ${warns[user.id]} warn(s)`);
    }

    // 🔨 BAN
    if (interaction.commandName === "ban") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: "❌ Pas la permission", ephemeral: true });
      }

      const user = interaction.options.getUser("user");
      const member = await interaction.guild.members.fetch(user.id);

      if (!member) return interaction.reply({ content: "❌ Introuvable", ephemeral: true });

      await member.ban().catch(() => {});
      return interaction.reply(`🔨 ${user.tag} banni`);
    }

    // 👢 KICK
    if (interaction.commandName === "kick") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return interaction.reply({ content: "❌ Pas la permission", ephemeral: true });
      }

      const user = interaction.options.getUser("user");
      const member = await interaction.guild.members.fetch(user.id);

      if (!member) return interaction.reply({ content: "❌ Introuvable", ephemeral: true });

      await member.kick().catch(() => {});
      return interaction.reply(`👢 ${user.tag} expulsé`);
    }

    // 🔇 MUTE
    if (interaction.commandName === "mute") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: "❌ Pas la permission", ephemeral: true });
      }

      const user = interaction.options.getUser("user");
      const member = await interaction.guild.members.fetch(user.id);

      if (!member) return interaction.reply({ content: "❌ Introuvable", ephemeral: true });

      await member.timeout(10 * 60 * 1000).catch(() => {});
      return interaction.reply(`🔇 ${user.tag} mute 10 min`);
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({ content: "❌ Erreur", ephemeral: true });
    }
  }
});

// 🚫 ANTI-INSULTES
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const userId = message.author.id;
  const content = normalize(message.content);

  const found = badWords.find(word => content.includes(word));
  if (!found) return;

  try {
    await message.delete();

    if (!warns[userId]) warns[userId] = 0;
    warns[userId]++;

    const count = warns[userId];

    if (count >= 3) {
      const member = await message.guild.members.fetch(userId);

      await member.timeout(5 * 60 * 1000, "Insultes");

      await message.channel.send(`🔇 ${message.author.tag} mute 5 min`);
      warns[userId] = 0;
      return;
    }

    await message.channel.send(`⚠️ ${message.author} (${count}/3)`);

  } catch (err) {
    console.error("Erreur anti-insultes :", err);
  }
});

// 🛑 ANTI CRASH
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// 🔑 LOGIN
client.login(process.env.TOKEN);
