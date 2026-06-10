module.exports = {
  config: {
    name: "slot",
    version: "2.0",
    author: "advanced",
    role: 0,
    category: "game",
    guide: "{pn} <bet>"
  },

  cooldowns: new Map(),

  onStart: async ({ message, event, args, usersData }) => {
    const uid = event.senderID;
    const bet = parseInt(args[0]);

    // ⏳ cooldown (5 sec)
    const now = Date.now();
    const cd = module.exports.cooldowns.get(uid) || 0;

    if (now - cd < 5000) {
      return message.reply("⏳ 5 seconds wait করো!");
    }
    module.exports.cooldowns.set(uid, now);

    // ❌ validation
    if (isNaN(bet) || bet <= 0) {
      return message.reply("⚠️ সঠিক bet দাও!\nExample: slot 100");
    }

    const user = await usersData.get(uid);
    if (!user) return message.reply("❌ User data error!");

    if (user.money < bet) {
      return message.reply("❌ Balance কম!");
    }

    const icons = ["🍒", "🍋", "🍊", "🍇", "7️⃣", "💎"];

    const a = icons[Math.floor(Math.random() * icons.length)];
    const b = icons[Math.floor(Math.random() * icons.length)];
    const c = icons[Math.floor(Math.random() * icons.length)];

    let text = `🎰 | ${a} | ${b} | ${c} |\n`;

    let multiplier = 0;

    // 💎 JACKPOT
    if (a === "💎" && b === "💎" && c === "💎") {
      multiplier = 10;
      text += "💎 JACKPOT!!!";
    }

    // 🎉 BIG WIN
    else if (a === b && b === c) {
      multiplier = 5;
      text += "🎉 BIG WIN!";
    }

    // 😊 SMALL WIN
    else if (a === b || b === c || a === c) {
      multiplier = 2;
      text += "😊 Small Win!";
    }

    // ❌ LOSE
    else {
      multiplier = 0;
      text += "❌ You Lost!";
    }

    let result = bet * multiplier;

    if (multiplier > 0) {
      user.money += result;
      text += `\n+${result} coins`;
    } else {
      user.money -= bet;
      text += `\n-${bet} coins`;
    }

    await usersData.set(uid, user);

    return message.reply(text);
  }
};
