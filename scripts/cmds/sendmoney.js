module.exports = {
  config: {
    name: "sendmoney",
    version: "2.1",
    author: "ANAS",
    role: 0,
    category: "economy",
    guide: "send money @user amount"
  },

  onStart: async ({ message, event, args, usersData }) => {
    try {
      const senderID = event.senderID;

      const targetID = Object.keys(event.mentions || {})[0] || args[1];
      const amount = parseFloat(args[2]);

      if (!targetID || !amount) {
        return message.reply("⚠️ send money @user 1000");
      }

      const sender = await usersData.get(senderID);
      const receiver = await usersData.get(targetID);

      if (!sender || !receiver) {
        return message.reply("❌ User data error!");
      }

      if (sender.money < amount) {
        return message.reply("❌ Insufficient balance!");
      }

      sender.money -= amount;
      receiver.money += amount;

      await usersData.set(senderID, sender);
      await usersData.set(targetID, receiver);

      return message.reply(
`💸 MONEY SENT

👤 To: ${targetID}
💰 Amount: ${amount}

✅ Success`
      );

    } catch (e) {
      console.log(e);
      return message.reply("❌ Command error occurred!");
    }
  }
};
