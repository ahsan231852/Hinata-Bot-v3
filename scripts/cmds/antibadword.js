module.exports = {
  config: {
    name: "antibadword",
    version: "2.0",
    author: "Ahsan Anas",
    role: 0,
    description: "Auto kick users for abusive language",
    eventType: ["message"]
  },

  onStart: async () => {},

  onChat: async ({ api, event }) => {
    if (!event.body) return;

    const badWords = [
      "fuck",
      "fucking",
      "motherfucker",
      "mf",
      "bitch",
      "son of bitch",
      "bastard",
      "asshole",
      "dick",
      "cunt",
      "slut",
      "whore",
      "madarchod",
      "behenchod",
      "khanki",
      "magi",
      "chudir",
      "chod",
      "bokachoda",
      "harami",
      "kuttar baccha",
      "shuorer baccha"
    ];

    const msg = event.body
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ");

    if (badWords.some(word => msg.includes(word))) {
      try {
        await api.sendMessage(
          "🚫 Anti-BadWord: Abusive language detected.\nUser has been removed from the group.",
          event.threadID
        );

        await api.removeUserFromGroup(
          event.senderID,
          event.threadID
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
};
