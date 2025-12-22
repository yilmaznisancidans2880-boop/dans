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

// yasaklı kelimeler
const bannedWords = ["küfür1", "küfür2", "argo1"]; // istediğin kadar ekle

io.on("connection", (socket) => {
  console.log("🟢 Bağlandı:", socket.id);

  // mevcut kullanıcıları gönder
  socket.emit("users", users);
  socket.emit("initMessages", messages);

  // kullanıcı katıldı
  socket.on("join", ({ username, password }) => {
    // LoverBoy kontrolü
    if(username === "LoverBoy") {
      const exists = users.some(u => u.username === "LoverBoy");
      if(exists) {
        socket.emit("joinError", "LoverBoy nicki zaten kullanılıyor!");
        return;
      }
      if(password !== "3530657Ynz") {
        socket.emit("joinError", "LoverBoy için şifre hatalı!");
        return;
      }
    }

    const user = { 
      id: socket.id, 
      username, 
      role: username === "LoverBoy" ? "admin" : "user" 
    };
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
    // küfür kontrolü
    if (bannedWords.some(word => msg.content.toLowerCase().includes(word))) {
      socket.emit("kicked", { reason: "Küfür kullandığınız için atıldınız." });
      socket.disconnect();
      return;
    }

    messages.push(msg);
    io.emit("chatMessage", msg);
  });

  // admin kullanıcı birini atarsa
  socket.on("kickUser", (userId) => {
    const adminUser = users.find(u => u.id === socket.id && u.role === "admin");
    if(!adminUser) return; // admin değilse işlem yok

    const target = users.find(u => u.id === userId);
    if(target) {
      io.to(userId).emit("kicked", { reason: "Admin tarafından atıldınız." });
      io.sockets.sockets.get(userId)?.disconnect();
    }
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
