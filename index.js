const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require("discord.js");

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
  }
});

client.login(process.env.TOKEN);