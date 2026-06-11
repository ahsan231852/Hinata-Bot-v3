const { createCanvas, registerFont, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const fontPath = path.join(__dirname, "fonts", "Kalpurush.ttf");
if (fs.existsSync(fontPath)) {
  registerFont(fontPath, { family: "Kalpurush" });
}

module.exports = {
  config: {
    name: "top",
    version: "5.0",
    author: "ANAS",
    role: 0,
    category: "economy",
    guide: "{pn}"
  },

  onStart: async function ({ event, usersData, message }) {
    const users = await usersData.getAll();

    const top = users
      .filter(u => typeof u.money === "number")
      .sort((a, b) => b.money - a.money)
      .slice(0, 15);

    const width = 1100;
    const height = 1700;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // ===== BACKGROUND (premium dark gradient) =====
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#050816");
    bg.addColorStop(0.5, "#0b1b3a");
    bg.addColorStop(1, "#050816");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // soft glow circles
    function glowCircle(x, y, color) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, 250);
      g.addColorStop(0, color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }

    glowCircle(200, 200, "rgba(0,255,200,0.15)");
    glowCircle(900, 300, "rgba(255,0,150,0.12)");

    // ===== TITLE =====
    ctx.textAlign = "center";
    ctx.font = 'bold 70px "Kalpurush", Arial';
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00f7ff";
    ctx.shadowBlur = 30;
    ctx.fillText("🏆 TOP PLAYERS 🏆", width / 2, 120);
    ctx.shadowBlur = 0;

    ctx.font = "22px Arial";
    ctx.fillStyle = "#9adfff";
    ctx.fillText("Leaderboard based on total balance", width / 2, 160);

    // format number
    const format = (n) => {
      if (!n) return "0";
      const units = [
        [1e12, "T"],
        [1e9, "B"],
        [1e6, "M"],
        [1e3, "K"]
      ];
      for (const [v, s] of units) {
        if (n >= v) return (n / v).toFixed(2).replace(/\.00$/, "") + s;
      }
      return n.toString();
    };

    // card draw function
    function card(x, y, w, h, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }

    const startY = 220;
    const gap = 95;

    for (let i = 0; i < top.length; i++) {
      const u = top[i];
      const y = startY + i * gap;

      // premium card style
      const bgColor =
        i === 0 ? "rgba(255,215,0,0.12)" :
        i === 1 ? "rgba(192,192,192,0.10)" :
        i === 2 ? "rgba(205,127,50,0.10)" :
        "rgba(255,255,255,0.05)";

      card(80, y, width - 160, 75, 18, bgColor);

      // left rank badge
      const badge =
        i === 0 ? "🥇" :
        i === 1 ? "🥈" :
        i === 2 ? "🥉" :
        `#${i + 1}`;

      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.fillText(badge, 110, y + 48);

      // avatar for ALL users (important upgrade)
      try {
        const avatar = await loadImage(
          `https://graph.facebook.com/${u.userID}/picture?width=120&height=120`
        );

        // glow ring for top 3
        ctx.beginPath();
        ctx.arc(210, y + 38, 32, 0, Math.PI * 2);
        ctx.strokeStyle =
          i === 0 ? "#ffd700" :
          i === 1 ? "#c0c0c0" :
          i === 2 ? "#cd7f32" :
          "#ffffff33";
        ctx.lineWidth = 4;
        ctx.stroke();

        // avatar clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(210, y + 38, 30, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, 180, y + 8, 60, 60);
        ctx.restore();

      } catch {}

      // name
      ctx.font = 'bold 28px "Kalpurush", Arial';
      ctx.fillStyle = "#ffffff";
      ctx.fillText((u.name || "Unknown").slice(0, 18), 260, y + 48);

      // money right side
      ctx.textAlign = "right";
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText(`${format(u.money || 0)} ৳`, width - 110, y + 48);
    }

    // footer
    ctx.textAlign = "center";
    ctx.font = "20px Arial";
    ctx.fillStyle = "#6ee7ff";
    ctx.fillText("🔥 Powered by Advanced Leaderboard System", width / 2, height - 40);

    const cache = path.join(__dirname, "cache");
    if (!fs.existsSync(cache)) fs.mkdirSync(cache);

    const file = path.join(cache, `top_${event.senderID}.png`);
    fs.writeFileSync(file, canvas.toBuffer("image/png"));

    return message.reply({
      body: "🏆 TOP 15 LEADERBOARD GENERATED",
      attachment: fs.createReadStream(file)
    }, () => fs.unlinkSync(file));
  }
};
