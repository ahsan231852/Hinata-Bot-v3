module.exports = {
  config: {
    name: "send",
    version: "3.0",
    author: "ANAS",
    role: 0,
    category: "economy",
    guide: "send @user 1k / 1m / 1b / 2.5k"
  },

  onStart: async ({ message, event, args, usersData }) => {
    const senderID = event.senderID;

    // 🎯 target (mention or uid)
    const targetID = Object.keys(event.mentions || {})[0] || args[0];

    // 💰 amount input
    let rawAmount = args[1];

    if (!targetID || !rawAmount) {
      return message.reply("⚠️ 𝐔𝐬𝐚𝐠𝐞: send @user 1k / 1m / 1b");
    }

    // 🔥 smart parser (k/m/b + decimal)
    const parseAmount = (v) => {
      v = v.toString().toLowerCase().replace(/\s/g, "");

      if (v.endsWith("k")) return parseFloat(v) * 1e3;
      if (v.endsWith("m")) return parseFloat(v) * 1e6;
      if (v.endsWith("b")) return parseFloat(v) * 1e9;

      return Number(v) || 0;
    };

    const amount = parseAmount(rawAmount);

    if (!amount || amount <= 0) {
      return message.reply("⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭!");
    }

    const sender = await usersData.get(senderID);
    const receiver = await usersData.get(targetID);

    if (!sender || !receiver) {
      return message.reply("❌ 𝐔𝐬𝐞𝐫 𝐝𝐚𝐭𝐚 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!");
    }

    // ❌ balance check
    if (sender.money < amount) {
      return message.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞!");
    }

    // 💸 transfer
    sender.money -= amount;
    receiver.money += amount;

    await usersData.set(senderID, sender);
    await usersData.set(targetID, receiver);

    // 💰 format function
    const format = (n) => {
      const u = ["", "K", "M", "B", "T"];
      let i = 0;
      while (n >= 1000 && i < u.length - 1) {
        n /= 1000;
        i++;
      }
      return n.toFixed(1).replace(/\.0$/, "") + u[i];
    };

    return message.reply(
`💸 𝐏𝐑𝐎 𝐌𝐎𝐍𝐄𝐘 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑

👤 𝐓𝐨: ${targetID}
💰 𝐀𝐦𝐨𝐮𝐧𝐭: $${format(amount)}

💳 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥

━━━━━━━━━━━━━━`
    );
  }
};
