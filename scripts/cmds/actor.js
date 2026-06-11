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
                description: "Guess the actor name game",
                category: "game"
        },

        langs: {
                en: {
                        start: "A random actor has appeared! Guess the name.",
                        correct: "✅ Correct! You got %1 coins and %2 exp.",
                        wrong: "❌ Wrong! Correct answer: %1",
                        notYour: "❌ This is not your game!"
                }
        },

        onReply: async function ({ api, event, Reply, usersData, getLang }) {
                const { actorNames, author } = Reply;

                const getCoin = 500;
                const getExp = 121;

                if (event.senderID !== author) {
                        return api.sendMessage(getLang("notYour"), event.threadID, event.messageID);
                }

                const reply = event.body.trim().toLowerCase();
                const userData = await usersData.get(event.senderID);

                await api.unsendMessage(Reply.messageID);

                const isCorrect = actorNames.some(name => reply.includes(name.toLowerCase()));

                if (isCorrect) {
                        userData.money += getCoin;
                        userData.exp += getExp;

                        // 🔥 DAILY TASK COUNTER ADDED HERE
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
        },

        onStart: async function ({ api, event, getLang }) {
                try {
                        const apiUrl = await baseApiUrl();
                        const response = await axios.get(`${apiUrl}/api/actor`);

                        const { name, imgurLink } = response.data.actor;
                        const actorNames = Array.isArray(name) ? name : [name];

                        const imageStream = await axios({
                                method: "GET",
                                url: imgurLink,
                                responseType: "stream"
                        });

                        return api.sendMessage(
                                {
                                        body: getLang("start"),
                                        attachment: imageStream.data
                                },
                                event.threadID,
                                (err, info) => {
                                        if (err) return;

                                        global.GoatBot.onReply.set(info.messageID, {
                                                commandName: this.config.name,
                                                messageID: info.messageID,
                                                author: event.senderID,
                                                actorNames
                                        });

                                        setTimeout(() => {
                                                api.unsendMessage(info.messageID);
                                        }, 40000);
                                },
                                event.messageID
                        );
                } catch (e) {
                        console.log(e);
                        return api.sendMessage("Error starting game!", event.threadID);
                }
        }
};
