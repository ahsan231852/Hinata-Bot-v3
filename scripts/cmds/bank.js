module.exports = {
  config: {
    name: "bank",
    version: "5.0",
    author: "ANAS + ChatGPT",
    role: 0,
    countDown: 5,
    category: "economy"
  },

  onStart: async ({ message, event, args, usersData }) => {
    const uid = event.senderID;

    // 🔥 SAFE GET (Hinata v3 compatible)
    let money = await usersData.get(uid, "money") || 0;
    let bank = await usersData.get(uid, "bank") || 0;
    let loan = await usersData.get(uid, "loan") || 0;
    let lastInterest = await usersData.get(uid, "lastInterest") || 0;

    const name = await usersData.get(uid, "name") || "User";

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

    // 🔥 PARSE K/M/B
    const parseAmount = (v) => {
      if (!v) return 0;
      v = v.toLowerCase();
      if (v.endsWith("k")) return parseFloat(v) * 1000;
      if (v.endsWith("m")) return parseFloat(v) * 1000000;
      if (v.endsWith("b")) return parseFloat(v) * 1000000000;
      return parseInt(v) || 0;
    };

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

    // ================= BALANCE =================
    if (
      command === "bal" ||
      command === "balance" ||
      (command === "bank" && (sub === "bal" || sub === "balance"))
    ) {
      return message.reply(
`╭─ [🏦 𝐇𝐈𝐍𝐀𝐓𝐀 𝐁𝐀𝐍𝐊 🏦]
╰──‣ 𝐁𝐚𝐛𝐲, 𝐲𝐨𝐮𝐫 𝐛𝐚𝐧𝐤 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${format(bank)}

• ${name}`
      );
    }

    // ================= DEPOSIT =================
    if (command === "deposit" || (command === "bank" && sub === "deposit")) {
      const amount = parseAmount(args[command === "bank" ? 2 : 1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (money < amount)
        return message.reply("❌ Not enough money.");

      money -= amount;
      bank += amount;

      await usersData.set(uid, "money", money);
      await usersData.set(uid, "bank", bank);

      return message.reply(
`🏦 Deposit Successful

💵 +${format(amount)}
🏦 Bank: ${format(bank)}`
      );
    }

    // ================= WITHDRAW =================
    if (command === "withdraw" || (command === "bank" && sub === "withdraw")) {
      const amount = parseAmount(args[command === "bank" ? 2 : 1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (bank < amount)
        return message.reply("❌ Not enough bank balance.");

      bank -= amount;
      money += amount;

      await usersData.set(uid, "money", money);
      await usersData.set(uid, "bank", bank);

      return message.reply(
`🏦 Withdraw Successful

💵 +${format(amount)}
🏦 Bank: ${format(bank)}`
      );
    }

    // ================= INTEREST =================
    if (command === "interest" || (command === "bank" && sub === "interest")) {
      const cooldown = 24 * 60 * 60 * 1000;

      if (Date.now() - lastInterest < cooldown)
        return message.reply("⏳ Wait 24 hours.");

      const interest = Math.floor(bank * 0.05);

      bank += interest;
      lastInterest = Date.now();

      await usersData.set(uid, "bank", bank);
      await usersData.set(uid, "lastInterest", lastInterest);

      return message.reply(
`🏦 Interest Added

💰 +${format(interest)}
🏦 Bank: ${format(bank)}`
      );
    }

    // ================= LOAN =================
    if (command === "loan" || (command === "bank" && sub === "loan")) {
      const amount = parseAmount(args[command === "bank" ? 2 : 1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      loan += amount;
      money += amount;

      await usersData.set(uid, "loan", loan);
      await usersData.set(uid, "money", money);

      return message.reply(
`💳 Loan Approved

💰 +${format(amount)}
📋 Loan: ${format(loan)}`
      );
    }

    // ================= PAY LOAN =================
    if (command === "payloan" || (command === "bank" && sub === "payloan")) {
      const amount = parseAmount(args[command === "bank" ? 2 : 1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (loan <= 0)
        return message.reply("✅ No loan.");

      if (money < amount)
        return message.reply("❌ Not enough money.");

      money -= amount;
      loan = Math.max(0, loan - amount);

      await usersData.set(uid, "money", money);
      await usersData.set(uid, "loan", loan);

      return message.reply(
`💳 Loan Paid

💰 -${format(amount)}
📋 Remaining: ${format(loan)}`
      );
    }

    return message.reply("❌ Invalid command.");
  }
};
