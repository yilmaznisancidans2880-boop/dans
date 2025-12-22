const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// static dosyalar
app.use(express.static(path.join(__dirname, "public")));

// anasayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === GERÇEK KULLANICILAR ===
let users = [];
let messages = [];

io.on("connection", (socket) => {
  console.log("🟢 Bağlandı:", socket.id);

  // mevcut kullanıcıları gönder
  socket.emit("users", users);
  socket.emit("initMessages", messages);

  // kullanıcı katıldı
  socket.on("join", (username) => {
    const user = { id: socket.id, username };
    users.push(user);

    io.emit("users", users);
    io.emit("chatMessage", {
      username: "Sistem",
      role: "admin",
      content: `${username} sohbete katıldı 👋`,
      time: new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  });

  // mesaj
  socket.on("chatMessage", (msg) => {
    messages.push(msg);
    io.emit("chatMessage", msg);
  });

  // ayrıldı
  socket.on("disconnect", () => {
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      users = users.filter((u) => u.id !== socket.id);

      io.emit("users", users);
      io.emit("chatMessage", {
        username: "Sistem",
        role: "admin",
        content: `${user.username} sohbetten ayrıldı 🚪`,
        time: new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    console.log("🔴 Ayrıldı:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
