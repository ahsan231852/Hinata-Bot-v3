const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "daily",
    version: "1.0",
    author: "Anas",
    countDown: 5,
    role: 0,
    description: "Daily mission complete and earn reward",
    category: "game",
  },

  onStart: async function ({ message, event, usersData }) {
    const { senderID } = event;

    const now = moment.tz("Asia/Dhaka");
    const today = now.format("DD/MM/YYYY");

    let userData = await usersData.get(senderID);

    // already claimed check
    if (userData.data?.dailyClaim === today) {
      return message.reply("❌ তুমি আজকের daily reward already নিয়ে নিয়েছো!\n⏳ কাল আবার try করো।");
    }

    // reward (10m)
    const reward = 10_000_000;

    // add money
    userData.money = (userData.money || 0) + reward;

    // save claim date
    userData.data.dailyClaim = today;

    await usersData.set(senderID, userData);

    return message.reply(
      `🎯 Daily Mission Complete!\n\n💰 তুমি পেলে: ${reward.toLocaleString()} coins\n📅 কাল আবার আসো নতুন reward এর জন্য!`
    );
  }
};
