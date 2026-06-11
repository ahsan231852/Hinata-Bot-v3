const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "dailytask",
    version: "1.1",
    author: "ANAS",
    role: 0,
    category: "game",
    description: "Daily mission tracker with progress image"
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
    { id: "usecmd", name: "Use 15 Commands", target: 15, reward: 2000000 },
    { id: "slot", name: "Slot Play", target: 10, reward: 1000000 }
  ],

  onStart: async function ({ event, usersData, message }) {
    const userID = event.senderID;

    let userData = await usersData.get(userID);
    if (!userData.dailyTask) userData.dailyTask = {};

    // default setup
    for (const m of this.missions) {
      if (userData.dailyTask[m.id] == null) {
        userData.dailyTask[m.id] = 0;
      }
    }

    const width = 900;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#121826";
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 28px Arial";
    ctx.fillText("🔥 DAILY MISSION PROGRESS", 180, 50);

    let y = 110;
    ctx.font = "18px Arial";

    for (const m of this.missions) {
      const progress = userData.dailyTask[m.id] || 0;
      const percent = Math.min(progress / m.target, 1);

      // mission text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        `${m.name} : ${progress}/${m.target} (${Math.floor(percent * 100)}%)`,
        50,
        y
      );

      // background bar
      ctx.fillStyle = "#333";
      ctx.fillRect(50, y + 10, 700, 14);

      // progress bar
      ctx.fillStyle = percent >= 1 ? "#00ff00" : "#00ccff";
      ctx.fillRect(50, y + 10, 700 * percent, 14);

      y += 70;
    }

    const buffer = canvas.toBuffer("image/png");

    return message.reply({
      body: "📊 Your Daily Mission Progress Report:",
      attachment: buffer
    });
  },

  // use this from other commands
  updateTask: async function (userData, taskID, amount = 1) {
    if (!userData.dailyTask) userData.dailyTask = {};
    userData.dailyTask[taskID] = (userData.dailyTask[taskID] || 0) + amount;
  }
};
