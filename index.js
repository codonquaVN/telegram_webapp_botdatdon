const express = require("express");
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;

// Load tin nhắn từ file (nếu có)
let messages = [];
if (fs.existsSync("messages.json")) {
  try {
    messages = JSON.parse(fs.readFileSync("messages.json"));
  } catch (err) {
    console.error("Lỗi đọc messages.json", err);
  }
}

// Lưu tin nhắn vào file
function saveMessages() {
  fs.writeFileSync("messages.json", JSON.stringify(messages, null, 2));
}

// Xóa tin nhắn cũ hơn 2 ngày
function clearOldMessages() {
  const now = Date.now();
  messages = messages.filter(m => now - m.time < 2 * 24 * 60 * 60 * 1000); // 48h
  saveMessages();
}

// Chạy dọn rác mỗi 1 giờ
setInterval(clearOldMessages, 60 * 60 * 1000);

// Khởi tạo bot Webhook
const bot = new TelegramBot(TOKEN, { webHook: true });

// Chuyển link thành HTML
function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

// Trang web hiển thị tin nhắn
app.get("/", (req, res) => {
  let html = "<h1>📢 Bảng tin cộng đồng</h1>";
  messages.slice().reverse().forEach(m => {
    html += `<p>🗣 ${linkify(m.text)}</p>`;
  });
  res.send(html);
});

// Webhook
app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Nhận tin nhắn Telegram
bot.on("message", (msg) => {
  if (msg.text) {
    messages.push({
      text: msg.text,
      time: Date.now()
    });
    saveMessages();
    console.log("New message:", msg.text);
  }
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
