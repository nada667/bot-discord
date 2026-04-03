// ========================
// IMPORTS
// ========================
const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField, 
  ChannelType, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require("discord.js");

// ========================
// CONFIG
// ========================
const GUILD_ID = "1487893628729823465";
let warns = {}; // Stockage des warns

// ========================
// LISTE DES INSULTES GRAVES
// ========================
const badWords = [
  "fdp","ntm","ptn","enculé","salope","pute","connard",
  "tg","ftg","clb","zbi","9hab","zaml","pédé","bâtard"
];

// ========================
// NORMALISATION DES MESSAGES
// ========================
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/[^a-z0-9]/g, "")       // caractères spéciaux
    .replace(/(.)\1+/g, "$1");       // lettres répétées
}

// ========================
// CREATION DU BOT
// ========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

// ========================
// BOT EN LIGNE
// ========================
client.once("ready", async () => {
  console.log("✅ Bot en ligne !");

  await client.application.commands.set([
    { name: "ping", description: "Test du bot" },
    { name: "ticket", description: "Créer un ticket" },
    { name: "warn", description: "Warn un membre", options: [{ name: "user", type: 6, required: true }] },
    { name: "ban", description: "Ban un membre", options: [{ name: "user", type: 6, required: true }] },
    { name: "kick", description: "Kick un membre", options: [{ name: "user", type: 6, required: true }] },
    { name: "mute", description: "Mute un membre (10 min)", options: [{ name: "user", type: 6, required: true }] }
  ], GUILD_ID);
});

// ========================
// COMMANDES SLASH
// ========================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const member = interaction.member;
    const user = interaction.options.getUser("user");

    // Ping
    if (interaction.commandName === "ping") return interaction.reply("🏓 Pong !");

    // Ticket
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
        new ButtonBuilder().setCustomId("close_ticket").setLabel("❌ Fermer").setStyle(ButtonStyle.Danger)
      );
      await channel.send({ content: `🎫 Ticket ouvert par ${interaction.user}`, components: [row] });
      return interaction.reply({ content: "✅ Ticket créé !", ephemeral: true });
    }

    // Warn
    if (interaction.commandName === "warn") {
      if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) 
        return interaction.reply({ content: "❌ Pas la permission", ephemeral: true });
      if (!warns[user.id]) warns[user.id] = 0;
      warns[user.id]++;
      return interaction.reply(`⚠️ ${user.tag} a ${warns[user.id]} warn(s)`);
    }

    // Ban
    if (interaction.commandName === "ban") {
      if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
        return interaction.reply({ content: "❌ Pas la permission", ephemeral: true });
      const target = await interaction.guild.members.fetch(user.id);
      await target.ban().catch(() => {});
      return interaction.reply(`🔨 ${user.tag} banni`);
    }

    // Kick
    if (interaction.commandName === "kick") {
      if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) 
        return interaction.reply({ content: "❌ Pas la permission", ephemeral: true });
      const target = await interaction.guild.members.fetch(user.id);
      await target.kick().catch(() => {});
      return interaction.reply(`👢 ${user.tag} expulsé`);
    }

    // Mute
    if (interaction.commandName === "mute") {
      if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) 
        return interaction.reply({ content: "❌ Pas la permission", ephemeral: true });
      const target = await interaction.guild.members.fetch(user.id);
      await target.timeout(10 * 60 * 1000).catch(() => {});
      return interaction.reply(`🔇 ${user.tag} mute 10 min`);
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) interaction.reply({ content: "❌ Erreur", ephemeral: true });
  }
});

// ========================
// BOUTON FERMER TICKET
// ========================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId === "close_ticket") await interaction.channel.delete();
});

// ========================
// MODERATION MESSAGES
// ========================
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;
  const content = normalize(message.content);
  const userId = message.author.id;

  if (badWords.some(word => content.includes(word))) {
    try {
      await message.delete();
      if (!warns[userId]) warns[userId] = 0;
      warns[userId]++;
      const count = warns[userId];

      const member = await message.guild.members.fetch(userId);
      await member.timeout(10 * 60 * 1000, "Insulte grave");
      await message.channel.send(`🔇 ${message.author.tag} mute (insulte grave)`);
      warns[userId] = 0;
    } catch (err) {
      console.error(err);
    }
  }
});

// ========================
// ANTI-CRASH GLOBAL
// ========================
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// ========================
// LOGIN
// ========================
client.login(process.env.TOKEN);
