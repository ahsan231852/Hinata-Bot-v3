const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "2.0",
    author: "Tarek",
    shortDescription: "Display bot and owner information",
    longDescription: "Shows detailed info including bot name, prefix, and owner's personal information.",
    category: "Special",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name;
    const mention = [{ id, tag: name }];

    // 🛠 Convert Google Drive view link to direct download link
    const fileId = "1QQ4rcb5mnLytHKuavPxOjx0rF-YuOTaS";
    const directURL = `https://files.catbox.moe/xojboq.mp4`;

    // ⏬ Download the file temporarily
    const filePath = path.join(__dirname, "owner-video.mp4");
    const response = await axios({
      url: directURL,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const info = 
`━━━━━━━━━━━━━━━━
👋 𝗛𝗲𝗹𝗹𝗼, ${name}

📌 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢
• 𝗡𝗮𝗺𝗲➝ 🎀✨[𝗦𝗢𝗝𝗜𝗕-𝗕𝗢𝗧]❤️‍🩹🪼🍷
• 𝗣𝗿𝗲𝗳𝗶𝘅 ➝*


‎
‎┃      🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🌟      
‎┃ 👤 𝐍𝐚𝐦𝐞      : 𝗦𝗼𝗷𝗶𝗯 𝗜𝘀𝗹𝗮𝗺 ッ
‎┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫    : 𝐌𝐚𝐥𝐞
‎┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧  : 𝗦𝗶𝗻𝗴𝗹𝗲
‎┃ 🎂 𝐀𝐠𝐞       : 17+
‎┃ 🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧  : 𝐈𝐬𝐥𝐚𝐦
‎┃ 🏫 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 : 𝗦𝘁𝘂𝗱𝗲𝗻𝘁
‎┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬  : 𝗥𝗮𝗻𝗴𝗽𝘂𝗿, 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡
‎
‎┃ 🎭 𝐓𝐢𝐤𝐭𝐨𝐤  : 𝗧𝗶𝗸𝘁𝗼𝗸 𝗶𝗱 𝗻𝗮𝗶 
‎┃ 📢 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 : @shaonislamjr
‎┃ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : https://www.facebook.com/profile.php?id=61585261020263
‎
‎
━━━━━━━━━━━━━━━━━`;

    message.reply({
      body: info,
      mentions: mention,
      attachment: fs.createReadStream(filePath)
    });
  }
};