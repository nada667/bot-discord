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

    // 🎫 PANEL
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

  // 🔘 BOUTONS
  if (interaction.isButton()) {

    // 🎫 OUVRIR
    if (interaction.customId === "open_ticket") {

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
        ]
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim_ticket")
          .setLabel("✅ Prendre")
          .setStyle(ButtonStyle.Success),

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

    // ✅ PRENDRE
    if (interaction.customId === "claim_ticket") {

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: "❌ Staff seulement", ephemeral: true });
      }

      return interaction.reply(`✅ ${interaction.user} a pris le ticket`);
    }

    // ❌ FERMER
    if (interaction.customId === "close_ticket") {

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: "❌ Staff seulement", ephemeral: true });
      }

      await interaction.reply("🔒 Fermeture...");
      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 2000);
    }
  }
});

// 🔑 LOGIN
client.login(process.env.TOKEN);
