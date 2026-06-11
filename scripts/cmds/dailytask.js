module.exports = {
  config: {
    name: "dailytask",
    version: "1.1",
    author: "ANAS",
    role: 0,
    category: "game",
    description: "Simple daily task tracker (text only)"
  },

  missions: [
    { id: "qz", name: "Quiz Game", target: 15, reward: 1000000 },
    { id: "ff", name: "Free Fire", target: 10, reward: 1000000 },
    { id: "anime", name: "Anime Quiz", target: 10, reward: 1000000 },
    { id: "waifu", name: "Waifu", target: 10, reward: 800000 },
    { id: "football", name: "Football", target: 1, reward: 1000000 },
    { id: "flag", name: "Flag Quiz", target: 10, reward: 1000000 },
    { id: "actor", name: "Actor Quiz", target: 10, reward: 1000000 },
    { id: "actress", name: "Actress Quiz", target: 10, reward: 1000000 },
    { id: "cartoon", name: "Cartoon Quiz", target: 10, reward: 1000000 },
    { id: "slot", name: "Slot Play", target: 10, reward: 1000000 }
  ],

  onStart: async function ({ event, usersData, message }) {
    const userID = event.senderID;

    let userData = await usersData.get(userID);
    if (!userData) userData = {};

    if (!userData.dailyTask) userData.dailyTask = {};

    let text = "🔥 DAILY TASK LIST 🔥\n\n";

    for (const m of this.missions) {
      const progress = userData.dailyTask[m.id] || 0;

      let status = "❌ NOT STARTED";
      if (progress >= m.target) status = "✅ COMPLETE";
      else status = `⏳ ${progress}/${m.target}`;

      text += `🎯 ${m.name}\n`;
      text += `➡ Progress: ${status}\n`;
      text += `💰 Reward: ${m.reward}\n\n`;
    }

    text += "━━━━━━━━━━━━━━━\n";
    text += "💡 Complete tasks to earn rewards!";

    return message.reply(text);
  },

  updateTask: async function (userData, taskID, amount = 1) {
    if (!userData.dailyTask) userData.dailyTask = {};
    userData.dailyTask[taskID] = (userData.dailyTask[taskID] || 0) + amount;
  }
};
