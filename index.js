const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Đọc JSON từ Telegram
app.use(bodyParser.json());

// Serve web (index.html trong thư mục public)
app.use(express.static("public"));

// Lưu tin nhắn trong RAM (nhanh – phù hợp MVP)
let messages = [];

// ================================
// TELEGRAM WEBHOOK
// ================================
app.post("/telegram", (req, res) => {
  const msg = req.body.message;

  // Chỉ xử lý tin nhắn text
  if (!msg || !msg.text) {
    return res.sendStatus(200);
  }

  const data = {
    user: msg.from.username || msg.from.first_name || "anonymous",
    text: msg.text,
    time: Date.now()
  };

  messages.push(data);

  // Giữ tối đa 200 tin cho nhẹ
  if (messages.length > 200) {
    messages.shift();
  }

  // Gửi realtime cho web
  io.emit("new_message", data);

  res.sendStatus(200);
});

// ================================
// API LẤY TIN CŨ
// ================================
app.get("/messages", (req, res) => {
  res.json(messages);
});

// ================================
// SOCKET.IO
// ================================
io.on("connection", () => {
  console.log("Client connected");
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
