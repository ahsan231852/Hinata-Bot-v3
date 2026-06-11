module.exports = {
  config: {
    name: "send money",
    version: "2.0",
    author: "ANAS",
    role: 0,
    category: "economy",
    guide: "send money @user amount"
  },

  onStart: async ({ message, event, args, usersData }) => {
    const senderID = event.senderID;

    const targetID = Object.keys(event.mentions || {})[0] || args[2];
    let amount = parseFloat(args[3]);

    if (!targetID || !amount || amount <= 0) {
      return message.reply("⚠️ 𝐔𝐬𝐚𝐠𝐞: send money @user 1000");
    }

    const sender = await usersData.get(senderID);
    const receiver = await usersData.get(targetID);

    if (!sender || !receiver) {
      return message.reply("❌ 𝐔𝐬𝐞𝐫 𝐝𝐚𝐭𝐚 𝐞𝐫𝐫𝐨𝐫!");
    }

    if (sender.money < amount) {
      return message.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞!");
    }

    sender.money -= amount;
    receiver.money += amount;

    await usersData.set(senderID, sender);
    await usersData.set(targetID, receiver);

    return message.reply(
`💸 𝐌𝐎𝐍𝐄𝐘 𝐒𝐄𝐍𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒

👤 𝐓𝐨: ${targetID}
💰 𝐀𝐦𝐨𝐮𝐧𝐭: $${amount}

✅ 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞𝐝`
    );
  }
};
