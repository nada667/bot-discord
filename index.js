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
const CATEGORY_ID = "1489322177869119558";
const STAFF_ROLE_ID = "1487912329046654986";
const LOG_CHANNEL_ID = "1488911081639379116";

// 🧠 insultes
const badWords = ["pute","connard","salope","fdp","fuck","shit","bitch","asshole","zbi","ntm","tg","ftg"];

// 🔧 normalisation
function normalize(text) {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
}

// 🤖 bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 📊 stockage
let warns = {};
let spam = {};

// ✅ READY
client.once("ready", async () => {
  console.log("🔥 Bot PRO MAX actif");

  await client.application.commands.set([
    { name: "ping", description: "Test" },
    { name: "panel", description: "Créer panel ticket" }
  ], GUILD_ID);
});

// ⚡ INTERACTION
client.on("interactionCreate", async (interaction) => {

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

  if (interaction.isButton()) {

    // 🎫 ouvrir ticket
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
          },
          {
            id: STAFF_ROLE_ID,
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
        content: `🎫 ${interaction.user} | Support en attente`,
        components: [row]
      });

      // 📊 log
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) logChannel.send(`📩 Ticket créé par ${interaction.user.tag}`);

      return interaction.editReply("✅ Ticket créé !");
    }

    // ❌ fermer
    if (interaction.customId === "close_ticket") {
      await interaction.reply({ content: "❌ Fermeture...", ephemeral: true });

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) logChannel.send(`❌ Ticket fermé par ${interaction.user.tag}`);

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 2000);
    }
  }
});

// 🚫 messages
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // 🔥 ANTI SPAM
  if (!spam[userId]) spam[userId] = { count: 0, time: Date.now() };

  spam[userId].count++;

  if (spam[userId].count > 5 && Date.now() - spam[userId].time < 5000) {
    await message.delete().catch(() => {});
    return;
  }

  setTimeout(() => {
    spam[userId].count = 0;
    spam[userId].time = Date.now();
  }, 5000);

  // 🚫 insultes
  const content = normalize(message.content);

  if (badWords.some(word => content.includes(word))) {

    await message.delete().catch(() => {});

    if (!warns[userId]) warns[userId] = 0;
    warns[userId]++;

    message.channel.send(`⚠️ ${message.author} (${warns[userId]}/3)`)
      .then(msg => setTimeout(() => msg.delete().catch(()=>{}), 3000));

    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) logChannel.send(`🚫 Insulte détectée: ${message.author.tag}`);

    if (warns[userId] >= 3) {
      const member = message.guild.members.cache.get(userId);

      if (member) {
        await member.timeout(5 * 60 * 1000).catch(() => {});
        message.channel.send(`🔇 ${message.author.tag} mute 5 min`);

        if (logChannel) logChannel.send(`🔇 ${message.author.tag} a été mute`);
      }

      warns[userId] = 0;
    }
  }
});

// 🔑 login
client.login(process.env.TOKEN);
