const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require("discord.js");

// 🧠 Liste des insultes (multi-langues)
const badWords = [
  "pute","connard","salope","fdp",
  "fuck","shit","bitch","asshole",
  "hmar","klb","zbi","9hab","zaml",
  "scheisse","arschloch","hurensohn",
  "puta","mierda","gilipollas",
  "orospu","amk","salak",
  "ntm","tg","ftg","mok","97ba","9lawi","nam","ptn","3zwa","l7wa","9ouwd","b9","w9","t9awd"
];

// 🔧 Normalisation (ignore accents, spam lettres, etc.)
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
}

// ⚙️ Création du bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔴 ID de ton serveur (garde le tien)
const GUILD_ID = "1487893628729823465";

// ✅ Quand le bot démarre
client.once("ready", async () => {
  console.log("Bot FULL PRO MAX 🔥");

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

// ⚡ Commandes slash
client.on("interactionCreate", async (interaction) => {
  if (interaction.commandName === "ban") {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    return interaction.reply("❌ Pas la permission");
  }

  const user = interaction.options.getUser("user");
  const member = interaction.guild.members.cache.get(user.id);

  await member.ban();
  interaction.reply(`🔨 ${user.tag} a été banni`);
  if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "kick") {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
    return interaction.reply("❌ Pas la permission");
  }

  const user = interaction.options.getUser("user");
  const member = interaction.guild.members.cache.get(user.id);

  await member.kick();
  interaction.reply(`👢 ${user.tag} a été expulsé`);
      if (interaction.commandName === "mute") {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    return interaction.reply("❌ Pas la permission");
  }

  const user = interaction.options.getUser("user");
  const member = interaction.guild.members.cache.get(user.id);

  await member.timeout(10 * 60 * 1000); // 10 minutes
  interaction.reply(`🔇 ${user.tag} a été mute 10 minutes`);
}
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

// 🚫 Détection insultes
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = normalize(message.content);

  if (badWords.some(word => content.includes(word))) {
    await message.delete().catch(() => {});
    message.channel.send(`${message.author} 🚫 langage interdit`);
  }
});
  await client.application.commands.set([
  {
    name: "ping",
    description: "Test du bot"
  },
  {
    name: "ticket",
    description: "Créer un ticket support"
  },
  {
    name: "ban",
    description: "Bannir un membre",
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
    name: "kick",
    description: "Expulser un membre",
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
    name: "mute",
    description: "Mute un membre",
    options: [
      {
        name: "user",
        type: 6,
        description: "Utilisateur",
        required: true
      }
    ]
  }
], GUILD_ID);

// 🔐 Connexion
client.login(process.env.TOKEN);
