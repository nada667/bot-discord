const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require("discord.js");

// 🧠 Liste des insultes
const badWords = [
  "pute","connard","salope","fdp",
  "fuck","shit","bitch","asshole",
  "hmar","klb","zbi","9hab","zaml",
  "scheisse","arschloch","hurensohn",
  "puta","mierda","gilipollas",
  "orospu","amk","salak",
  "ntm","tg","ftg","mok","97ba","9lawi","nam","ptn","3zwa","l7wa","9ouwd","b9","w9","t9awd"
];

// 🔧 Normalisation
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
}

// 🤖 Création du bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔴 TON ID SERVEUR
const GUILD_ID = "1487893628729823465";

// 📊 Système de warn
let warns = {};

// ✅ Quand le bot démarre
client.once("ready", async () => {
  console.log("✅ Bot en ligne !");

  await client.application.commands.set([
    { name: "ping", description: "Test du bot" },
    { name: "ticket", description: "Créer un ticket" },

    {
      name: "warn",
      description: "Warn un membre",
      options: [
        {
          name: "user",
          type: 6,
          description: "Utilisateur",
          required: true
        }
      ]
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

// ⚡ COMMANDES SLASH
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {

    // 🏓 Ping
    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong !");
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
      return interaction.reply({ content: "✅ Ticket créé !", ephemeral: true });
    }

    // ⚠️ WARN
    if (interaction.commandName === "warn") {
      const user = interaction.options.getUser("user");

      if (!warns[user.id]) warns[user.id] = 0;
      warns[user.id]++;

      return interaction.reply(`⚠️ ${user.tag} a ${warns[user.id]} warn(s)`);
    }

    // 🔨 BAN
    if (interaction.commandName === "ban") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply("❌ Pas la permission");
      }

      const user = interaction.options.getUser("user");
      const member = interaction.guild.members.cache.get(user.id);

      if (!member) return interaction.reply("❌ Introuvable");

      await member.ban().catch(() => {});
      return interaction.reply(`🔨 ${user.tag} banni`);
    }

    // 👢 KICK
    if (interaction.commandName === "kick") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return interaction.reply("❌ Pas la permission");
      }

      const user = interaction.options.getUser("user");
      const member = interaction.guild.members.cache.get(user.id);

      if (!member) return interaction.reply("❌ Introuvable");

      await member.kick().catch(() => {});
      return interaction.reply(`👢 ${user.tag} expulsé`);
    }

    // 🔇 MUTE
    if (interaction.commandName === "mute") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply("❌ Pas la permission");
      }

      const user = interaction.options.getUser("user");
      const member = interaction.guild.members.cache.get(user.id);

      if (!member) return interaction.reply("❌ Introuvable");

      await member.timeout(10 * 60 * 1000).catch(() => {});
      return interaction.reply(`🔇 ${user.tag} mute 10 min`);
    }

  } catch (err) {
    console.error(err);
    interaction.reply("❌ Erreur");
  }
});

// 🚫 ANTI-INSULTES
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = normalize(message.content);

  if (badWords.some(word => content.includes(word))) {

    await message.delete().catch(() => {});

    if (!warns[message.author.id]) warns[message.author.id] = 0;
    warns[message.author.id]++;

    if (warns[message.author.id] >= 3) {
      const member = message.guild.members.cache.get(message.author.id);

      await member.timeout(5 * 60 * 1000).catch(() => {});
      message.channel.send(`🔇 ${message.author.tag} mute 5 min`);

      warns[message.author.id] = 0;
      return;
    }

    message.channel.send(`⚠️ ${message.author} (${warns[message.author.id]}/3)`);
  }
});

// 🔑 Connexion
client.login(process.env.TOKEN);
