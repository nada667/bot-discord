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

// 🧠 DATA
let warns = {};
let spam = {};

// 🚫 INSULTES
const badWords = [
  "pute","connard","salope","fdp",
  "fuck","shit","bitch","asshole",
  "hmar","klb","zbi","9hab","zaml",
  "ntm","tg","ftg"
];

// 🔧 NORMALIZE
function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
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
      description: "Warn",
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
      description: "Mute",
      options: [{ name: "user", type: 6, required: true }]
    }
  ], GUILD_ID);
});

// ⚡ COMMANDES + BOUTONS
client.on("interactionCreate", async (interaction) => {

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
      return interaction.reply(`⚠️ ${user.tag} (${warns[user.id]})`);
    }

    if (interaction.commandName === "ban") {
      const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id);
      if (!member) return interaction.reply("❌ Introuvable");
      await member.ban().catch(() => {});
      return interaction.reply("🔨 Banni");
    }

    if (interaction.commandName === "kick") {
      const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id);
      if (!member) return interaction.reply("❌ Introuvable");
      await member.kick().catch(() => {});
      return interaction.reply("👢 Expulsé");
    }

    if (interaction.commandName === "mute") {
      const member = interaction.guild.members.cache.get(interaction.options.getUser("user").id);
      if (!member) return interaction.reply("❌ Introuvable");
      await member.timeout(10 * 60 * 1000).catch(() => {});
      return interaction.reply("🔇 Muté");
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "close_ticket") {
      await interaction.channel.delete();
    }
  }
});

// 🚫 ANTI-SPAM + INSULTES
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

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
    spam[userId].count = 0;
    return;
  }

  const content = normalize(message.content);

  if (badWords.some(w => content.includes(w))) {
    await message.delete().catch(() => {});

    if (!warns[userId]) warns[userId] = 0;
    warns[userId]++;

    if (warns[userId] >= 3) {
      const member = message.guild.members.cache.get(userId);
      await member.timeout(5 * 60 * 1000).catch(() => {});
      warns[userId] = 0;
      return;
    }

    message.channel.send(`⚠️ ${message.author} (${warns[userId]}/3)`);
  }
});

// 🔑 LOGIN
client.login(process.env.TOKEN);
