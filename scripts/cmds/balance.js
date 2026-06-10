module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "টাকা"],
    version: "2.0",
    author: "ANAS",
    countDown: 5,
    role: 0,
    description: "Show wallet balance in stylish UI",
    category: "economy",
  },

  onStart: async function ({ message, usersData, event }) {
    const { mentions, senderID } = event;

    const formatNumber = (num) => {
      if (!num) return "0";
      let n = Number(num);
      const units = ["", "K", "M", "B", "T"];
      let unit = 0;
      while (n >= 1000 && unit < units.length - 1) {
        n /= 1000;
        unit++;
      }
      return n.toFixed(1).replace(/\.0$/, "") + units[unit];
    };

    // 🔥 TAGGED USERS
    if (Object.keys(mentions).length > 0) {
      let msg = "";
      for (const uid of Object.keys(mentions)) {
        const money = await usersData.get(uid, "money");
        const name = mentions[uid].replace("@", "");

        msg +=
`>🎀 ${name}

𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${formatNumber(money)}

`;
      }
      return message.reply(msg);
    }

    // 🔥 SELF BALANCE
    const money = await usersData.get(senderID, "money");
    const name = (await usersData.get(senderID, "name")) || "User";

    return message.reply(
`>🎀 ${name}

𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${formatNumber(money)}`
    );
  }
};
