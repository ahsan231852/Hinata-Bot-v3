const fs = require("fs-extra");

module.exports = {
    config: {
        name: "give",
        aliases: ["send", "transfer"],
        version: "6.1",
        author: "xalman + ANAS",
        countDown: 2,
        role: 0,
        description: "Transfer money with 5% fee (text only)",
        category: "economy",
        guide: "{pn} @tag [amount]"
    },

    onStart: async function ({ message, event, usersData, args }) {

        const senderID = event.senderID;

        const targetUID =
            event.messageReply?.senderID ||
            Object.keys(event.mentions || {})[0];

        const parseAmount = (str) => {
            if (!str) return NaN;
            str = str.toLowerCase().replace(/,/g, "");

            let num = parseFloat(str);
            if (isNaN(num)) return NaN;

            const map = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
            const unit = str.slice(-1);

            if (map[unit]) num *= map[unit];

            return Math.floor(num);
        };

        const amount = parseAmount(args.at(-1));

        if (!targetUID || targetUID === senderID || !amount || amount <= 0) {
            return message.reply("❌ Usage: give @tag [amount]");
        }

        const senderData = await usersData.get(senderID);
        const receiverData = await usersData.get(targetUID);

        if (!receiverData) {
            return message.reply("❌ User not found!");
        }

        const senderMoney = Number(senderData.money || 0);

        // 🔥 5% fee calculation
        const fee = Math.floor(amount * 0.05);
        const totalDeduct = amount + fee;

        if (senderMoney < totalDeduct) {
            return message.reply("❌ Not enough balance (including 5% fee)!");
        }

        // 💰 update balances
        await Promise.all([
            usersData.set(senderID, {
                money: (senderMoney - totalDeduct).toString()
            }),
            usersData.set(targetUID, {
                money: (Number(receiverData.money || 0) + amount).toString()
            })
        ]);

        // 🧾 response message
        return message.reply(
`✅ | 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐁𝐚𝐛𝐲

• 𝐅𝐫𝐨𝐦: ${senderData.name}
• 𝐓𝐨: ${receiverData.name}
• 𝐀𝐦𝐨𝐮𝐧𝐭: ${amount}
• 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫 𝐜𝐨𝐬𝐭 (5%): ${fee}
• 𝐓𝐨𝐭𝐚𝐥 𝐝𝐞𝐝𝐮𝐜𝐭𝐞𝐝: ${totalDeduct}`
        );
    }
};
