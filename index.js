require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();

const { TOKEN, PREFIX } = process.env;

// Get all files from our commands dir
const commandFiles = fs
  .readdirSync("./classes/commands")
  .filter((file) => file.endsWith(".js"));

// Loop through all command files and require/add them to discordjs
for (const file of commandFiles) {
  const command = require(`./classes/commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (message) => {
  // Make sure message starts with our bots PREFIX or not a bot user don't continue
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  // Get all args user sent
  const args = message.content.slice(PREFIX.length).split(/ +/);

  // Get the first arg which is the command name, remove it from args & return it & convert to lowercase
  const commandName = args.shift().toLowerCase();

  // Get or find the command the user sent
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  // If the command the user sent doesn't exist don't continue
  if (!command) return;

  // If the command requires to be guild only & its not then reply
  if (command.guildOnly && message.channel.type !== "text") {
    return message.reply("I can't execute that command inside DMs!");
  }

  // If the command requires args & user didn't provide them
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  // If the args provided dont match the amount of args the command requires
  if (command.args && args.length != command.amountOfArgs) {
    let reply = `You didn't provide the correct number of arguments (${command.amountOfArgs}), ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `Please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error trying to execute that command!");
  }
});

client.login(TOKEN);
