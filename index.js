const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

// 🔴 CONFIG
const GUILD_ID = "1487893628729823465";
const LOG_CHANNEL_ID = "MET_ID_LOGS_ICI";

// 🧠 DATA
let warns = {};
let spam = {};

// 🚫 INSULTES
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
  console.log("🔥 Bot en ligne");

  await client.application.commands.set([
    { name: "ping", description: "Test" },
    { name: "ticket", description: "Créer un ticket" },
    {
      name: "warn",
      description: "Warn un membre",
      options: [{ name: "user", type: 6, required: true }]
    },
    {
      name: "ban",
      description: "Ban",
      options: [{ name: "user", type: 6, required: true }]
    },
    {
      name: "kick",
      description: "Kick",
      options: [{ name: "user", type: 6, required: true }]
    },
    {
      name: "mute",
      description: "Mute 10 min",
      options: [{ name: "user", type: 6, required: true }]
    }
  ], GUILD_ID);
});

// ⚡ COMMANDES + BOUTONS
client.on("interactionCreate", async (interaction) => {

  // 🧾 COMMANDES
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong");
    }

    if (interaction.commandName === "ticket") {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
        ]
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("❌ Fermer")
          .setStyle(ButtonStyle.Danger)
      );

      channel.send({
        content: `🎫 Ticket de ${interaction.user}`,
        components: [row]
      });

      return interaction.reply({ content: "✅ Ticket créé", ephemeral: true });
    }

    if (interaction.commandName === "warn") {
      const user = interaction.options.getUser("user");
      if (!warns[user.id]) warns[user.id] = 0;
      warns[user.id]++;
      return interaction.reply(`⚠️ ${user.tag} (${warns[user.id]} warns)`);
    }

    if (interaction.commandName === "ban") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return interaction.reply("❌ Permission");

      const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id);
      if (!member) return interaction.reply("❌ Introuvable");

      await member.ban().catch(() => {});
      return interaction.reply("🔨 Banni");
    }

    if (interaction.commandName === "kick") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
        return interaction.reply("❌ Permission");

      const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id);
      if (!member) return interaction.reply("❌ Introuvable");

      await member.kick().catch(() => {});
      return interaction.reply("👢 Expulsé");
    }

    if (interaction.commandName === "mute") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
        return interaction.reply("❌ Permission");

      const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id);
      if (!member) return interaction.reply("❌ Introuvable");

      await member.timeout(10 * 60 * 1000).catch(() => {});
      return interaction.reply("🔇 Muté 10 min");
    }
  }

  // 🔘 BOUTON FERMER TICKET
  if (interaction.isButton()) {
    if (interaction.customId === "close_ticket") {
      await interaction.channel.delete();
    }
  }
});

// 🚫 ANTI-SPAM + INSULTES + LOGS
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // 🔥 ANTI-SPAM
  if (!spam[userId]) spam[userId] = { count: 0, last: Date.now() };

  const now = Date.now();

  if (now - spam[userId].last < 3000) {
    spam[userId].count++;
  } else {
    spam[userId].count = 1;
  }

  spam[userId].last = now;

  if (spam[userId].count >= 5) {
    await message.delete().catch(() => {});
    const member = message.guild.members.cache.get(userId);
    await member.timeout(5 * 60 * 1000).catch(() => {});
    message.channel.send(`🚫 ${message.author} spam`);
    spam[userId].count = 0;
    return;
  }

  // 🚫 INSULTES
  const content = normalize(message.content);

  if (badWords.some(w => content.includes(w))) {

    await message.delete().catch(() => {});

    if (!warns[userId]) warns[userId] = 0;
    warns[userId]++;

    // 📊 LOGS
    const log = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) log.send(`🚫 ${message.author.tag} → ${message.content}`);

    if (warns[userId] >= 3) {
      const member = message.guild.members.cache.get(userId);
      await member.timeout(5 * 60 * 1000).catch(() => {});
      message.channel.send(`🔇 ${message.author.tag} mute`);
      warns[userId] = 0;
      return;
    }

    message.channel.send(`⚠️ ${message.author} (${warns[userId]}/3)`);
  }
});

// 🔑 LOGIN
client.login(process.env.TOKEN);
