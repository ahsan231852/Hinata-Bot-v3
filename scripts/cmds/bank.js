module.exports = {
  config: {
    name: "bank",
    version: "3.0",
    author: "ANAS + ChatGPT",
    role: 0,
    countDown: 5,
    category: "economy"
  },

  onStart: async ({ message, event, args, usersData }) => {
    const uid = event.senderID;
    const user = await usersData.get(uid);

    // ✅ SAFE INIT (MUST)
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

    const action = (args[0] || "").toLowerCase();

    // ================= MENU =================
    if (!action) {
      return message.reply(
`╭─ [🏦 BANK SYSTEM]
╰‣ bal
╰‣ deposit
╰‣ withdraw
╰‣ interest
╰‣ loan
╰‣ payloan
╰‣ send money

• ${name}`
      );
    }

    // ================= BALANCE =================
    if (["bal", "balance"].includes(action)) {
      return message.reply(
`>🎀 ${name}

𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: $${format(user.bank)}`
      );
    }

    // ================= DEPOSIT =================
    if (action === "deposit") {
      const amount = parseAmount(args[1]);

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
    if (action === "withdraw") {
      const amount = parseAmount(args[1]);

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (user.bank < amount)
        return message.reply("❌ Not enough bank money.");

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
    if (action === "interest") {
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
    if (action === "loan") {
      const amount = parseAmount(args[1]);

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
    if (action === "payloan") {
      const amount = parseAmount(args[1]);

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

    // ================= SEND MONEY =================
    if (action === "send") {
      if (args[1] !== "money")
        return message.reply("❌ Use: send money @user 1000");

      const mention = Object.keys(event.mentions || {});
      const amount = parseAmount(args[2]);

      if (mention.length === 0)
        return message.reply("❌ Tag someone.");

      if (amount <= 0)
        return message.reply("❌ Invalid amount.");

      const receiverID = mention[0];
      const receiver = await usersData.get(receiverID);

      if (user.money < amount)
        return message.reply("❌ Not enough balance.");

      user.money -= amount;
      receiver.money = (receiver.money || 0) + amount;

      await usersData.set(uid, user);
      await usersData.set(receiverID, receiver);

      return message.reply(
`💸 Sent Successfully

👤 To: ${event.mentions[receiverID]}
💰 Amount: ${format(amount)}

🏦 Your Balance: ${format(user.money)}`
      );
    }

    return message.reply("❌ Invalid command.");
  }
};
