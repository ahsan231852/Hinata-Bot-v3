module.exports = {
  config: {
    name: "bank",
    version: "4.0",
    author: "ANAS + ChatGPT",
    role: 0,
    countDown: 5,
    category: "economy"
  },

  onStart: async ({ message, event, args, usersData }) => {
    const uid = event.senderID;
    const user = await usersData.get(uid);

    // ✅ SAFE INIT (NEVER BREAK)
    if (!user.money) user.money = 0;
    if (!user.bank) user.bank = 0;
    if (!user.loan) user.loan = 0;
    if (!user.lastInterest) user.lastInterest = 0;

    const name = user.name || "User";

    // 🔥 FORMAT NUMBER
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

    // 🔥 K/M/B SUPPORT
    const parseAmount = (v) => {
      if (!v) return 0;
      v = v.toLowerCase();
      if (v.endsWith("k")) return parseFloat(v) * 1000;
      if (v.endsWith("m")) return parseFloat(v) * 1000000;
      if (v.endsWith("b")) return parseFloat(v) * 1000000000;
      return parseInt(v) || 0;
    };

    // 🔥 SMART INPUT HANDLING
    const command = (args[0] || "").toLowerCase();
    const sub = (args[1] || "").toLowerCase();

    // ================= MENU =================
    if (!command) {
      return message.reply(
`╭─ [🏦 BANK SYSTEM]
╰‣ bank bal
╰‣ bank deposit
╰‣ bank withdraw
╰‣ bank interest
╰‣ bank loan
╰‣ bank payloan

• ${name}`
      );
    }

    // ================= BALANCE (SMART FIX) =================
    if (
      command === "bal" ||
      command === "balance" ||
      (command === "bank" && (sub === "bal" || sub === "balance"))
    ) {
      return message.reply(
`>🎀 ${name}

𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: $${format(user.bank)}`
      );
    }

    // ================= DEPOSIT =================
    if (command === "deposit" || (command === "bank" && sub === "deposit")) {
      const amount = parseAmount(args[command === "bank" ? 2 : 1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (user.money < amount)
        return message.reply("❌ Not enough money.");

      user.money -= amount;
      user.bank += amount;

      await usersData.set(uid, user);

      return message.reply(
`🏦 Deposit Done

💵 +${format(amount)}
🏦 Bank: ${format(user.bank)}`
      );
    }

    // ================= WITHDRAW =================
    if (command === "withdraw" || (command === "bank" && sub === "withdraw")) {
      const amount = parseAmount(args[command === "bank" ? 2 : 1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (user.bank < amount)
        return message.reply("❌ Not enough bank balance.");

      user.bank -= amount;
      user.money += amount;

      await usersData.set(uid, user);

      return message.reply(
`🏦 Withdraw Done

💵 +${format(amount)}
🏦 Bank: ${format(user.bank)}`
      );
    }

    // ================= INTEREST =================
    if (command === "interest" || (command === "bank" && sub === "interest")) {
      const cooldown = 24 * 60 * 60 * 1000;

      if (Date.now() - user.lastInterest < cooldown)
        return message.reply("⏳ Wait 24 hours.");

      const interest = Math.floor(user.bank * 0.05);

      user.bank += interest;
      user.lastInterest = Date.now();

      await usersData.set(uid, user);

      return message.reply(
`🏦 Interest Added

💰 +${format(interest)}
🏦 Bank: ${format(user.bank)}`
      );
    }

    // ================= LOAN =================
    if (command === "loan" || (command === "bank" && sub === "loan")) {
      const amount = parseAmount(args[command === "bank" ? 2 : 1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      user.loan += amount;
      user.money += amount;

      await usersData.set(uid, user);

      return message.reply(
`💳 Loan Approved

💰 +${format(amount)}
📋 Loan: ${format(user.loan)}`
      );
    }

    // ================= PAY LOAN =================
    if (command === "payloan" || (command === "bank" && sub === "payloan")) {
      const amount = parseAmount(args[command === "bank" ? 2 : 1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (user.loan <= 0)
        return message.reply("✅ No loan.");

      if (user.money < amount)
        return message.reply("❌ Not enough money.");

      user.money -= amount;
      user.loan = Math.max(0, user.loan - amount);

      await usersData.set(uid, user);

      return message.reply(
`💳 Loan Paid

💰 -${format(amount)}
📋 Remaining: ${format(user.loan)}`
      );
    }

    return message.reply("❌ Invalid command.");
  }
};
