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

// ✅ Quand le bot démarre
client.once("ready", async () => {
  console.log("Bot en ligne 🔥");

  await client.application.commands.set([
    { name: "ping", description: "Test du bot" },
    { name: "ticket", description: "Créer un ticket" },
    {
      name: "ban",
      description: "Bannir un membre",
      options: [{
        name: "user",
        type: 6,
        description: "Utilisateur",
        required: true
      }]
    },
    {
      name: "kick",
      description: "Expulser un membre",
      options: [{
        name: "user",
        type: 6,
        description: "Utilisateur",
        required: true
      }]
    },
    {
      name: "mute",
      description: "Mute un membre",
      options: [{
        name: "user",
        type: 6,
        description: "Utilisateur",
        required: true
      }]
    }
  ], GUILD_ID);
});

// ⚡ Commandes
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
    return interaction.reply({ content: "✅ Ticket créé !", ephemeral: true });
  }

  // 🔨 BAN
  if (interaction.commandName === "ban") {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply("❌ Pas la permission");
    }

    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    await member.ban();
    return interaction.reply(`🔨 ${user.tag} a été banni`);
  }

  // 👢 KICK
  if (interaction.commandName === "kick") {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply("❌ Pas la permission");
    }

    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    await member.kick();
    return interaction.reply(`👢 ${user.tag} a été expulsé`);
  }

  // 🔇 MUTE (10 min)
  if (interaction.commandName === "mute") {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply("❌ Pas la permission");
    }

    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    await member.timeout(10 * 60 * 1000);
    return interaction.reply(`🔇 ${user.tag} a été mute 10 minutes`);
  }
});

// 🚫 Anti-insultes
let warns = {};
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = normalize(message.content);

  if (badWords.some(word => content.includes(word))) {

    // 🔴 SUPPRIME TOUJOURS D'ABORD
    await message.delete().catch(() => {});

    // ➜ warn
    if (!warns[message.author.id]) warns[message.author.id] = 0;
    warns[message.author.id]++;

    // ➜ si 3 warns = mute
    if (warns[message.author.id] >= 3) {
      const member = message.guild.members.cache.get(message.author.id);

      await member.timeout(5 * 60 * 1000).catch(() => {});
      message.channel.send(`🔇 ${message.author.tag} mute 5 min`);

      warns[message.author.id] = 0;
      return; // 🔥 IMPORTANT (stop ici)
    }

    // ➜ sinon warn normal
    message.channel.send(`⚠️ ${message.author} (${warns[message.author.id]}/3)`);
  }
});
// 🔑 Connexion
client.login(process.env.TOKEN);
