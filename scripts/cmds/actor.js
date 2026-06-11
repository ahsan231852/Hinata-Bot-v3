const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "actor",
                aliases: ["actorgame"],
                version: "1.8",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                category: "game"
        },

        onReply: async function ({ api, event, Reply, usersData, getLang }) {

                const { actorNames, author } = Reply;

                if (event.senderID !== author) {
                        return api.sendMessage(getLang("notYour"), event.threadID, event.messageID);
                }

                const reply = event.body.trim().toLowerCase();
                const userData = await usersData.get(event.senderID);

                // 🔥 GAME LIMIT SYSTEM
                userData.tasks = userData.tasks || {};
                userData.tasks.actor = userData.tasks.actor || 0;

                if (userData.tasks.actor >= 10) {
                        return api.sendMessage(
                                "❌ You already played 10 times!\n🎁 Bonus 1M added to your account!",
                                event.threadID,
                                event.messageID
                        );
                }

                await api.unsendMessage(Reply.messageID);

                const isCorrect = actorNames.some(name =>
                        reply.includes(name.toLowerCase())
                );

                const getCoin = 500;
                const getExp = 121;

                if (isCorrect) {
                        userData.money += getCoin;
                        userData.exp += getExp;

                        // 🔥 COUNT +1
                        userData.tasks.actor += 1;

                        // 🎁 10 TIMES BONUS
                        if (userData.tasks.actor === 10) {
                                userData.money += 1000000;
                        }

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

                } catch (error) {
                        console.log(error);
                        return api.sendMessage("❌ Error starting game!", event.threadID);
                }
        }
};
