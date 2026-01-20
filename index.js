const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;

// ✅ Khởi tạo bot ở chế độ WEBHOOK
const bot = new TelegramBot(TOKEN, { webHook: true });

// Trang web công cộng
let messages = [];

app.get("/", (req, res) => {
  let html = "<h1>📢 Bảng tin cộng đồng</h1>";
  messages.slice().reverse().forEach(m => {
    html += `<p>🗣 ${m}</p>`;
  });
  res.send(html);
});

// ✅ Endpoint webhook ĐÚNG
app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200); // BẮT BUỘC phải trả 200
});

// Nhận tin nhắn
bot.on("message", (msg) => {
  if (msg.text) {
    messages.push(msg.text);
    console.log("New message:", msg.text);
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
