const axios = require('axios');
const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe"],
    version: "6.9.0",
    author: "dipto",
    countDown: 0,
    role: 0,
    description: "better then all sim simi",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeeMessage]"
    }
};

module.exports.onStart = async ({
    api,
    event,
    args,
    usersData
}) => {
    const link = `${await baseApiUrl()}/baby`;
    const dipto = args.join(" ").toLowerCase();
    const uid = event.senderID;
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === 'remove') {
            const fina = dipto.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
            return api.sendMessage(dat, event.threadID, event.messageID);
        }

        if (args[0] === 'rm' && dipto.includes('-')) {
            const [fi, f] = dipto.replace("rm ", "").split(' - ');
            const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
            return api.sendMessage(da, event.threadID, event.messageID);
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const teachers = await Promise.all(data.teacher.teacherList.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = (await usersData.get(number)).name;
                    return {
                        name,
                        value
                    };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data.length;
                return api.sendMessage(`Total Teach = ${d}`, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = dipto.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
        }

        if (args[0] === 'edit') {
            const command = dipto.split(' - ')[1];
            if (command.length < 2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
            return api.sendMessage(`changed ${dA}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}`);
            const tex = re.data.message;
            const teacher = (await usersData.get(re.data.teacher)).name;
            return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach react ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data, event.threadID, event.messageID);
        }

        const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
        api.sendMessage(d, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("Check console for error", event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({
    api,
    event,
    Reply
}) => {
    try {
        if (event.type == "message_reply") {
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({
    api,
    event,
    message,
    usersData
}) => {
    try {
        const body = event.body ? event.body?.toLowerCase() : "";
        const uid = event.senderID;
        const name = (await usersData.get(uid)).name || "প্রিয়";

        if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("bot") || body.startsWith("jan") || body.startsWith("babu") || body.startsWith("janu") || body.startsWith("বট") || body.startsWith("জান") || body.startsWith("জানু") || body.startsWith("বাবু")) {
            const arr = body.replace(/^\S+\s*/, "");

            const rawReplies = [
              "_আমার বস 𝚂𝙾𝙹𝙸𝙱 এর মন খারাপ 🥺",
              "তুই কি Wi-Fi? কাছে এলেই কানেকশন হারায়া ফেলি 😵",
              "Hmm bolo 🐹",
              "_বট বট না করে আমার বস 𝚂𝙾𝙹𝙸𝙱 রে মেসেজ দে 🐸",
              "এতো ডাকাডাকি করস কেন 😾",
              "😘💋",
              "Yes 🐣",
              "তুই পড়তে না বসে যদি আরেকটা মেসেজ দিস... তাহলে তুই গরু 🐄🤓",
              "I am here 💅",
              "Hi 🙃",
              "hae bolo Jan pakhi 🎀✨",
              "হ্যাঁ টুনটুনি বলো 🤭","আমি তোরে সাহায্য করতে পারবো না কারণ তুই অনেক পচা!!😬","_আমাকে না ডেকে আমার বস 𝚂𝙾𝙹𝙸𝙱 কে ডাক দে😝","আমাকে এত ডাকিস কেন!🐥","hae bolo Jan pakhi","হুম বলো না বাবু 🥺",
              "জানু হাঙ্গা করবা🙈","কি বলবা আমার বসের কাছে বল🦆💨","hussss😼","ভালোবাসা নামক আব্লামি করতে চাইলে আমার বস 𝚂𝙾𝙹𝙸𝙱 এর ইনবক্স যাও 🙊🥱👅","তোর কথা তোর বাড়ি কেউ শুনে না, তো আমি কেন শুনবো? 🤔😂","এতো ডাকছিস কেন? গালি শুনবি নাকি? 🤬","ঝাং 🫵 থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦","তুমি নাকি আমার বস 𝚂𝙾𝙹𝙸𝙱 এর বউ 🙈😥","আমি রাগ করলে 𝚂𝙾𝚁𝚁𝚈 বলবি নাহলে 𝙱𝙻𝙾𝙲𝙺 😤","তুমি নাকি আমার বস 𝚂𝙾𝙹𝙸𝙱 এর বউ 🙈😥","আমাকে না ডেকে আমার বস 𝚂𝙾𝙹𝙸𝙱 কে জি এফ দাও 😽🫶🌺","-ব্যাপার নাহ্ লাংii ছাড়াও জীবন চলে..!😇💔","-𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমারে 𝐁𝐥𝐚𝐜𝐤𝐦𝐚𝐢𝐥 করা হচ্ছে-🥲🤦‍♂️🤧","হাসতে হাসতে মুতে দেওয়া পাসের বাসার আন্টি😗","✫ কালো আকাশে সাদা তারা…!😇🥺– বেঁচে আছি 𝗴𝗳 ছাড়া..! 𝘂𝗳𝗳𝗳 ✫ 🐱🐤🧑‍🍼","এই যুগে আপন পর সকল সম্পর্কই টাকার উপর নির্ভরশীল! 🤝💸","ওই জান কাছে আসো 🫦👅","কথা'টা তিতা হলেও সত্যি বর্তমানে রক্তের টানের চেয়েও টাকার টান বেশি!💸🖤",
            ];

            const selectedReply = rawReplies[Math.floor(Math.random() * rawReplies.length)];
            const finalReply =selectedReply;

            if (!arr) {
                await api.sendMessage(finalReply, event.threadID, (error, info) => {
                    if (!info) return message.reply("info obj not found");
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID);
                return;
            }

            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};