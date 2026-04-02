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
const CATEGORY_ID = "1489322302238625994"; // ⚠️ MET ICI TON ID

// 🧠 DATA
let warns = {};
let spam = {};

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
    { name: "panel", description: "Créer panel ticket" }
  ], GUILD_ID);
});

// ⚡ INTERACTIONS
client.on("interactionCreate", async (interaction) => {

  // 🧾 COMMANDES
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong");
    }

    // 🎫 Panel
    if (interaction.commandName === "panel") {

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("open_ticket")
          .setLabel("🎫 Ouvrir un ticket")
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({
        content: "🎫 Clique pour ouvrir un ticket",
        components: [row]
      });
    }
  }

  // 🎟️ BOUTON TICKET
if (interaction.isButton()) {

  if (interaction.customId === "open_ticket") {

    // 🔒 éviter spam
    await interaction.deferReply({ ephemeral: true });

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: "1489322177869119558", // ⚠️ IMPORTANT
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

    await interaction.editReply("✅ Ticket créé !");
  }

  // 🔴 BOUTON FERMER
  if (interaction.customId === "close_ticket") {
    await interaction.reply({ content: "❌ Ticket fermé", ephemeral: true });
    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  }
}
// 🔑 LOGIN
client.login(process.env.TOKEN);
