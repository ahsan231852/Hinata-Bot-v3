module.exports = {
  config: {
    name: "bank",
    version: "1.1",
    author: "ANAS",
    role: 0,
    countDown: 5,
    category: "economy",
    guide: {
      en: "{pn} | balance | deposit <amount> | withdraw <amount> | interest | loan <amount> | payloan <amount> | send money @user <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData }) => {
    const uid = event.senderID;
    const user = await usersData.get(uid);

    // ✅ SAFE INIT (IMPORTANT FIX)
    if (!user.money) user.money = 0;
    if (!user.bank) user.bank = 0;
    if (!user.loan) user.loan = 0;
    if (!user.lastInterest) user.lastInterest = 0;

    const name = user.name || "User";

    const formatNumber = (num) => {
      if (!num) return "0";
      let n = Number(num);
      const units = ["", "K", "M", "B", "T"];
      let unit = 0;
      while (n >= 1000 && unit < units.length - 1) {
        n /= 1000;
        unit++;
      }
      return n.toFixed(1).replace(/\.0$/, "") + units[unit];
    };

    const action = (args[0] || "").toLowerCase();

    // MENU
    if (!action) {
      return message.reply(
`╭─ [🏦 𝐇𝐈𝐍𝐀𝐓𝐀 𝐁𝐀𝐍𝐊 🏦]
╰‣ Balance
╰‣ Deposit
╰‣ Withdraw
╰‣ Interest
╰‣ Loan
╰‣ PayLoan
╰‣ Send Money

• ${name}`
      );
    }

    // BALANCE
    if (action === "balance") {
      return message.reply(
`🏦 Bank Balance

💰 ${formatNumber(user.bank)}

• ${name}`
      );
    }

    // DEPOSIT
    if (action === "deposit") {
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (user.money < amount)
        return message.reply("❌ Not enough money.");

      user.money -= amount;
      user.bank += amount;

      await usersData.set(uid, user);

      return message.reply(
`🏦 Deposit Done

💵 +${formatNumber(amount)}
🏦 Bank: ${formatNumber(user.bank)}`
      );
    }

    // WITHDRAW
    if (action === "withdraw") {
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (user.bank < amount)
        return message.reply("❌ Not enough bank balance.");

      user.bank -= amount;
      user.money += amount;

      await usersData.set(uid, user);

      return message.reply(
`🏦 Withdraw Done

💵 +${formatNumber(amount)}
🏦 Bank: ${formatNumber(user.bank)}`
      );
    }

    // INTEREST
    if (action === "interest") {
      const cooldown = 24 * 60 * 60 * 1000;

      if (Date.now() - user.lastInterest < cooldown) {
        return message.reply("⏳ Wait for next interest (24h)");
      }

      const interest = Math.floor(user.bank * 0.05);

      user.bank += interest;
      user.lastInterest = Date.now();

      await usersData.set(uid, user);

      return message.reply(
`🏦 Interest Added

💰 +${formatNumber(interest)}
🏦 Bank: ${formatNumber(user.bank)}`
      );
    }

    // LOAN
    if (action === "loan") {
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Invalid amount.");

      user.loan += amount;
      user.money += amount;

      await usersData.set(uid, user);

      return message.reply(
`💳 Loan Approved

💰 +${formatNumber(amount)}
📋 Loan: ${formatNumber(user.loan)}`
      );
    }

    // PAYLOAN
    if (action === "payloan") {
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Invalid amount.");

      if (user.loan <= 0)
        return message.reply("✅ No active loan.");

      if (user.money < amount)
        return message.reply("❌ Not enough money.");

      user.money -= amount;
      user.loan = Math.max(0, user.loan - amount);

      await usersData.set(uid, user);

      return message.reply(
`💳 Loan Paid

💰 -${formatNumber(amount)}
📋 Remaining Loan: ${formatNumber(user.loan)}`
      );
    }

    // 💸 SEND MONEY (FIXED)
    if (action === "send" && args[1] === "money") {
      const mention = Object.keys(event.mentions || {});
      const amount = parseInt(args[2]);

      if (mention.length === 0)
        return message.reply("❌ Tag someone.");

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Invalid amount.");

      const receiverID = mention[0];

      if (receiverID === uid)
        return message.reply("❌ Cannot send to yourself.");

      const receiver = await usersData.get(receiverID);

      if (user.money < amount)
        return message.reply("❌ Not enough balance.");

      user.money -= amount;
      receiver.money = (receiver.money || 0) + amount;

      await usersData.set(uid, user);
      await usersData.set(receiverID, receiver);

      return message.reply(
`💸 Money Sent

👤 To: ${event.mentions[receiverID]}
💰 Amount: ${formatNumber(amount)}

🏦 Your Balance: ${formatNumber(user.money)}`
      );
    }

    // RULES
    if (action === "rules") {
      return message.reply(
`🏦 BANK RULES

• Interest 5% per 24h
• Deposit earns interest
• Loan must be repaid manually
• Transfer allowed`
      );
    }

    return message.reply("❌ Invalid command.");
  }
};
