module.exports = {
  config: {
    name: "slot",
    version: "4.0",
    author: "ANAS",
    role: 0,
    category: "game",
    guide: "{pn} <bet>"
  },

  cooldowns: new Map(),

  onStart: async ({ message, event, args, usersData }) => {
    const uid = event.senderID;

    // ⏳ cooldown
    const now = Date.now();
    const cd = module.exports.cooldowns.get(uid) || 0;

    if (now - cd < 5000) {
      return message.reply("⏳ 5 seconds wait করো!");
    }
    module.exports.cooldowns.set(uid, now);

    // 💰 BET PARSER (FIXED 1k / 1m / 1b / 2.5m)
    const parseBet = (v) => {
      if (!v) return 0;

      v = v.toString().toLowerCase().replace(/\s/g, "");

      if (v.endsWith("k")) return parseFloat(v) * 1000;
      if (v.endsWith("m")) return parseFloat(v) * 1000000;
      if (v.endsWith("b")) return parseFloat(v) * 1000000000;

      return Number(v) || 0;
    };

    const bet = parseBet(args[0]);

    // ❌ validation
    if (!bet || bet <= 0) {
      return message.reply("⚠️ সঠিক bet দাও!\nExample: slot 1k / 1m / 500");
    }

    const user = await usersData.get(uid);
    if (!user) return message.reply("❌ User data error!");

    if (user.money < bet) {
      return message.reply("❌ Balance কম!");
    }

    // 🎰 icons (pro theme)
    const icons = ["💜", "🤍", "🤎", "💛", "💚", "💙", "💎"];

    const a = icons[Math.floor(Math.random() * icons.length)];
    const b = icons[Math.floor(Math.random() * icons.length)];
    const c = icons[Math.floor(Math.random() * icons.length)];

    let multiplier = 0;
    let resultText = "";

    // 💎 JACKPOT
    if (a === "💎" && b === "💎" && c === "💎") {
      multiplier = 10;
      resultText = "💎 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 !!!";
    }

    // 🎉 BIG WIN
    else if (a === b && b === c) {
      multiplier = 5;
      resultText = "🎉 𝐁𝐈𝐆 𝐖𝐈𝐍 !!";
    }

    // 😊 SMALL WIN
    else if (a === b || b === c || a === c) {
      multiplier = 2;
      resultText = "😊 𝐒𝐌𝐀𝐋𝐋 𝐖𝐈𝐍";
    }

    // ❌ LOSE
    else {
      multiplier = 0;
      resultText = "❌ 𝐘𝐎𝐔 𝐋𝐎𝐒𝐓";
    }

    const winAmount = bet * multiplier;

    if (multiplier > 0) {
      user.money += winAmount;
    } else {
      user.money -= bet;
    }

    await usersData.set(uid, user);

    // 💰 FORMAT
    const format = (n) => {
      if (!n) return "0";
      let num = Number(n);
      const u = ["", "K", "M", "B", "T"];
      let i = 0;
      while (num >= 1000 && i < u.length - 1) {
        num /= 1000;
        i++;
      }
      return num.toFixed(1).replace(/\.0$/, "") + u[i];
    };

    // 🎯 WIN RATE
    const winRate = Math.floor(Math.random() * 60 + 20);

    return message.reply(
`>🎰 𝐒𝐋𝐎𝐓 𝐆𝐀𝐌𝐄

• 𝐑𝐞𝐬𝐮𝐥𝐭: [ ${a} | ${b} | ${c} ]
• ${resultText}

• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 ${multiplier > 0 ? "𝐖𝐨𝐧" : "𝐋𝐨𝐬𝐭"} $${format(multiplier > 0 ? winAmount : bet)}

🎯 𝐖𝐢𝐧 𝐑𝐚𝐭𝐞: ${winRate}%`
    );
  }
};
