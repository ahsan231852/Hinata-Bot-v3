const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "actor",
                aliases: ["actorgame"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                category: "game"
        },

        langs: {
                en: {
                        start: "🎭 Guess the actor name!",
                        correct: "✅ Correct! +%1 coins +%2 exp",
                        wrong: "❌ Wrong! Answer: %1",
                        notYour: "❌ Not your game!"
                }
        },

        onReply: async function ({ api, event, Reply, usersData, getLang }) {
                try {
                        const { actorNames, author } = Reply;

                        if (event.senderID !== author) {
                                return api.sendMessage(getLang("notYour"), event.threadID, event.messageID);
                        }

                        const reply = event.body.trim().toLowerCase();
                        const userData = await usersData.get(event.senderID);

                        await api.unsendMessage(Reply.messageID);

                        const isCorrect = actorNames.some(name =>
                                reply.includes(name.toLowerCase())
                        );

                        const getCoin = 500;
                        const getExp = 121;

                        if (isCorrect) {
                                userData.money += getCoin;
                                userData.exp += getExp;

                                // 🔥 DAILY TASK COUNTER FIX
                                userData.tasks = userData.tasks || {};
                                userData.tasks.actor = (userData.tasks.actor || 0) + 1;

                                await usersData.set(event.senderID, userData);

                                return api.sendMessage(
                                        getLang("correct", getCoin, getExp),
                                        event.threadID,
                                        event.messageID
                                );
                        } else {
                                return api.sendMessage(
                                        getLang("wrong", actorNames.join(", ")),
                                        event.threadID,
                                        event.messageID
                                );
                        }

                } catch (err) {
                        console.log("Reply Error:", err);
                        return api.sendMessage("❌ Reply error occurred!", event.threadID);
                }
        },

        onStart: async function ({ api, event, getLang }) {
                try {
                        const apiUrl = await baseApiUrl();

                        const res = await axios.get(`${apiUrl}/api/actor`);
                        const { name, imgurLink } = res.data.actor;

                        const actorNames = Array.isArray(name) ? name : [name];

                        const img = await axios({
                                url: imgurLink,
                                method: "GET",
                                responseType: "stream"
                        });

                        const msg = await api.sendMessage(
                                {
                                        body: getLang("start"),
                                        attachment: img.data
                                },
                                event.threadID
                        );

                        if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();

                        global.GoatBot.onReply.set(msg.messageID, {
                                commandName: this.config.name,
                                messageID: msg.messageID,
                                author: event.senderID,
                                actorNames
                        });

                        setTimeout(() => {
                                api.unsendMessage(msg.messageID);
                        }, 40000);

                } catch (err) {
                        console.log("Actor Start Error:", err);
                        return api.sendMessage("❌ Error starting actor game!", event.threadID);
                }
        }
};
