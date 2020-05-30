const { generateProxy, findCountry, countries } = require("../gen");

module.exports = {
  name: "generate",
  description: "Generate Stellar Proxies Automatically.",
  args: true,
  amountOfArgs: 3,
  usage: "sticky US 100",
  // Seconds to wait till next message from user is allowed
  cooldown: 5,
  guildOnly: false,
  execute(message, args) {
    let [sticky, country, amount] = args;

    // Attempt to find country user inputted
    country = findCountry(country);

    // Country exists
    if (country) {
      let proxies = [];

      // Loop through amount of proxies to generate & add each to proxies list
      for (let i = 0; i < amount; i++) {
        proxies.push(generateProxy(country, sticky === "sticky"));
      }

      // If we got any proxies
      if (proxies) {
        message.channel.send("Proxies attached, enjoy!", {
          files: [
            {
              attachment: Buffer.from(proxies.join("\n")),
              name: "proxies.txt",
            },
          ],
        });
      } else {
        message.channel.send("No proxies generated");
      }
    } else {
      message.channel.send(
        `Country does not exist, available countries are (${countries.map(
          (country) => `${country.name} |`
        )}`
      );
    }
  },
};
