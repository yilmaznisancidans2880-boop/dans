const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// kullanıcı ve mesaj listesi
let users = [];
let messages = [];

// yasaklı kelimeler
const bannedWords = ["küfür1","küfür2","argo1"];

// bot listesi (Türkçe isimler)
const botNames = [
  "Deniz", "Elif", "Mert", "Ayşe", "Can", "Zeynep", "Emre", "Seda", "Baran", "Ece",
  "Kerem", "Selin", "Tunç", "Derya", "Yasemin", "Berk", "Melis", "Kaan", "Aylin", "Onur",
  "Cem", "İpek", "Burak", "Gamze", "Arda", "Funda", "Ege", "Nazlı", "Ozan", "Selma"
];

// bot mesajları
const botMessages = [
  "Selam nasılsınız?", "Bugün hava çok güzel değil mi?", "Yeni bir şarkı keşfettim!", 
  "Dans etmeyi sever misiniz?", "Herkese iyi akşamlar!", "Film öneriniz var mı?", 
  "Son zamanlarda ne izlediniz?", "Merhaba!", "Gününüz nasıl geçiyor?", "Bu sohbet harika!"
];

// bot kullanıcılarını ekle
botNames.forEach(name => {
  users.push({ id: `bot_${name}`, username: name, role: "bot" });
});

// botlar arası sohbet için fonksiyon
function randomBotChat() {
  if(users.filter(u => u.role === "bot").length === 0) return;

  const botUser = users.filter(u => u.role === "bot")[Math.floor(Math.random() * botNames.length)];
  const botMessage = botMessages[Math.floor(Math.random() * botMessages.length)];

  const msg = {
    username: botUser.username,
    role: "bot",
    content: botMessage,
    time: new Date().toLocaleTimeString("tr-TR",{ hour:"2-digit", minute:"2-digit" })
  };

  messages.push(msg);
  io.emit("chatMessage", msg);

  // bot mesajlarını 5-15 saniye arası tekrar et
  setTimeout(randomBotChat, Math.floor(Math.random() * 10000) + 5000);
}

// ilk bot sohbetini başlat
setTimeout(randomBotChat, 5000);

io.on("connection", (socket) => {
  console.log("🟢 Bağlandı:", socket.id);

  socket.emit("users", users);
  socket.emit("initMessages", messages);

  socket.on("join", ({ username, password }) => {
    // LoverBoy kontrolü
    if(username === "LoverBoy") {
      if(users.some(u => u.username === "LoverBoy")) {
        socket.emit("joinError", "LoverBoy nicki zaten kullanılıyor!");
        return;
      }
      if(password !== "3530657Ynz") {
        socket.emit("joinError", "LoverBoy şifresi hatalı!");
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
      time: new Date().toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" })
    });
  });

  socket.on("chatMessage", (msg) => {
    if(bannedWords.some(word => msg.content.toLowerCase().includes(word))) {
      socket.emit("kicked", { reason: "Küfür kullandığınız için atıldınız." });
      socket.disconnect();
      return;
    }
    messages.push(msg);
    io.emit("chatMessage", msg);
  });

  socket.on("kickUser", (userId) => {
    const adminUser = users.find(u => u.id === socket.id && u.role === "admin");
    if(!adminUser) return;

    const target = users.find(u => u.id === userId);
    if(target) {
      io.to(userId).emit("kicked", { reason: "Admin tarafından atıldınız." });
      io.sockets.sockets.get(userId)?.disconnect();
    }
  });

  socket.on("disconnect", () => {
    const user = users.find(u => u.id === socket.id);
    if(user) {
      users = users.filter(u => u.id !== socket.id);
      io.emit("users", users);
      io.emit("chatMessage", {
        username:"Sistem",
        role:"admin",
        content:`${user.username} sohbetten ayrıldı 🚪`,
        time: new Date().toLocaleTimeString("tr-TR",{ hour:"2-digit", minute:"2-digit" })
      });
    }
    console.log("🔴 Ayrıldı:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
