module.exports = {
  config: {
    name: "bank",
    version: "1.0",
    author: "ANAS",
    role: 0,
    countDown: 5,
    category: "economy",
    guide: {
      en: "{pn} | balance | deposit <amount> | withdraw <amount> | interest | loan <amount> | payloan <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData }) => {
    const uid = event.senderID;
    const user = await usersData.get(uid);

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
╰‣ 𝐁𝐚𝐥𝐚𝐧𝐜𝐞
╰‣ 𝐃𝐞𝐩𝐨𝐬𝐢𝐭
╰‣ 𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰
╰‣ 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭
╰‣ 𝐋𝐨𝐚𝐧
╰‣ 𝐏𝐚𝐲𝐋𝐨𝐚𝐧
╰‣ 𝐑𝐮𝐥𝐞𝐬

• ${name}`
      );
    }

    // BALANCE
    if (action === "balance") {
      return message.reply(
`╭─ [🏦 𝐇𝐈𝐍𝐀𝐓𝐀 𝐁𝐀𝐍𝐊 🏦]
╰──‣ 𝐁𝐚𝐛𝐲, 𝐲𝐨𝐮𝐫 𝐛𝐚𝐧𝐤 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${formatNumber(user.bank)}

• ${name}`
      );
    }

    // DEPOSIT
    if (action === "deposit") {
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Enter a valid amount.");

      if (user.money < amount)
        return message.reply("❌ You don't have enough money.");

      user.money -= amount;
      user.bank += amount;

      await usersData.set(uid, user);

      return message.reply(
`🏦 Deposit Successful

💵 Deposited: $${formatNumber(amount)}
🏦 Bank: $${formatNumber(user.bank)}`
      );
    }

    // WITHDRAW
    if (action === "withdraw") {
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Enter a valid amount.");

      if (user.bank < amount)
        return message.reply("❌ Not enough bank balance.");

      user.bank -= amount;
      user.money += amount;

      await usersData.set(uid, user);

      return message.reply(
`🏦 Withdraw Successful

💵 Withdrawn: $${formatNumber(amount)}
🏦 Bank: $${formatNumber(user.bank)}`
      );
    }

    // INTEREST
    if (action === "interest") {
      const cooldown = 24 * 60 * 60 * 1000;

      if (Date.now() - user.lastInterest < cooldown) {
        const left = cooldown - (Date.now() - user.lastInterest);
        const hours = Math.floor(left / 3600000);

        return message.reply(
          `⏳ You can claim interest again in ${hours} hour(s).`
        );
      }

      const interest = Math.floor(user.bank * 0.05);

      if (interest <= 0)
        return message.reply("❌ Deposit money first.");

      user.bank += interest;
      user.lastInterest = Date.now();

      await usersData.set(uid, user);

      return message.reply(
`🏦 Interest Claimed

💰 Interest: $${formatNumber(interest)}
🏦 New Balance: $${formatNumber(user.bank)}`
      );
    }

    // LOAN
    if (action === "loan") {
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Enter a valid amount.");

      user.loan += amount;
      user.money += amount;

      await usersData.set(uid, user);

      return message.reply(
`💳 Loan Approved

💰 Loan: $${formatNumber(amount)}
📋 Total Loan: $${formatNumber(user.loan)}`
      );
    }

    // PAYLOAN
    if (action === "payloan") {
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return message.reply("❌ Enter a valid amount.");

      if (user.money < amount)
        return message.reply("❌ Not enough wallet balance.");

      if (user.loan <= 0)
        return message.reply("✅ No active loan.");

      user.money -= amount;
      user.loan -= amount;

      if (user.loan < 0)
        user.loan = 0;

      await usersData.set(uid, user);

      return message.reply(
`✅ Loan Payment Successful

💵 Paid: $${formatNumber(amount)}
📋 Remaining Loan: $${formatNumber(user.loan)}`
      );
    }

    // RULES
    if (action === "rules") {
      return message.reply(
`🏦 HINATA BANK RULES

• Interest: 5% every 24 hours
• Deposit money for interest
• Loan must be repaid manually
• Withdraw anytime`
      );
    }

    return message.reply("❌ Invalid option.");
  }
};
