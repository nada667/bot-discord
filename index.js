const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField, 
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

// 🧠 Liste insultes
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

// 🤖 Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔴 TON ID SERVEUR
const GUILD_ID = "1487893628729823465";

// 🔴 ID CATEGORIE TICKET (REMPLACE)
const CATEGORY_ID = "MET_ICI_ID_CATEGORIE";

// ⚠️ système warn
let warns = {};

// ✅ READY
client.once("ready", async () => {
  console.log("Bot en ligne 🔥");

  await client.application.commands.set([
    { name: "ping", description: "Test" },
    { name: "panel", description: "Créer le panel ticket" }
  ], GUILD_ID);
});

// ⚡ INTERACTIONS
client.on("interactionCreate", async (interaction) => {

  // 📌 SLASH COMMANDES
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "ping") {
      return interaction.reply("pong 🏓");
    }

    if (interaction.commandName === "panel") {

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("open_ticket")
          .setLabel("🎫 Ouvrir un ticket")
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({
        content: "📩 Clique pour ouvrir un ticket",
        components: [row]
      });
    }
  }

  // 🎟️ BOUTONS
  if (interaction.isButton()) {

    // 🔓 OUVRIR
    if (interaction.customId === "open_ticket") {

      await interaction.deferReply({ ephemeral: true });

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
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

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("❌ Fermer")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🎫 Ticket de ${interaction.user}`,
        components: [row]
      });

      return interaction.editReply("✅ Ticket créé !");
    }

    // 🔒 FERMER
    if (interaction.customId === "close_ticket") {
      await interaction.reply({ content: "❌ Fermeture...", ephemeral: true });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 2000);
    }
  }
});

// 🚫 ANTI-INSULTES + WARN + MUTE
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = normalize(message.content);

  if (badWords.some(word => content.includes(word))) {

    // ❌ supprime message
    await message.delete().catch(() => {});

    // warn
    if (!warns[message.author.id]) warns[message.author.id] = 0;
    warns[message.author.id]++;

    // message temporaire
    message.channel.send(`⚠️ ${message.author} (${warns[message.author.id]}/3)`)
      .then(msg => setTimeout(() => msg.delete().catch(()=>{}), 3000));

    // 🔇 mute si 3 warns
    if (warns[message.author.id] >= 3) {
      const member = message.guild.members.cache.get(message.author.id);

      if (member) {
        await member.timeout(5 * 60 * 1000).catch(() => {});
        message.channel.send(`🔇 ${message.author.tag} mute 5 min`);
      }

      warns[message.author.id] = 0;
    }
  }
});

// 🔑 TOKEN (MET TON TOKEN ICI)
client.login("TON_TOKEN_ICI");
