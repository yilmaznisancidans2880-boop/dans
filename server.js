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

// =====================
// QUIZ BOT AYARLARI
// =====================
const questions = [
  { q: "Evrenin yaşının yaklaşık olarak kaç milyar yıl olduğu tahmin edilmektedir?", a: "13.8" },
  { q: "Newton'un hareket yasalarından üçüncüsü nedir?", a: "etki-tepki" },
  { q: "İnsan DNA'sında kaç baz çifti bulunur?", a: "3 milyar" },
  { q: "Dünyada en uzun süre tahtta kalan monark kimdir?", a: "louis xiv" },
  { q: "Einstein'ın izafiyet teorisini hangi yılda yayınladı?", a: "1905" }
];

let currentQuestion = null;
let answered = false;

function sendQuizQuestion() {
  answered = false;
  currentQuestion = questions[Math.floor(Math.random() * questions.length)];
  io.emit("chatMessage", {
    username: "QuizBot",
    role: "bot",
    content: "Hazırsanız soru geliyor: " + currentQuestion.q,
    time: new Date().toLocaleTimeString("tr-TR",{ hour:"2-digit", minute:"2-digit" })
  });

  setTimeout(() => {
    if(!answered){
      io.emit("chatMessage", {
        username: "QuizBot",
        role: "bot",
        content: "Süre doldu! Doğru cevap: " + currentQuestion.a,
        time: new Date().toLocaleTimeString("tr-TR",{ hour:"2-digit", minute:"2-digit" })
      });
    }
    sendQuizQuestion(); // yeni soru başlat
  }, 10000); // 10 saniye
}

// =====================
// SOCKET.IO BAĞLANTI
// =====================
io.on("connection", (socket) => {
  console.log("🟢 Bağlandı:", socket.id);

  socket.emit("users", users);
  socket.emit("initMessages", messages);

  socket.on("join", ({ username, password }) => {
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
      time: new Date().toLocaleTimeString("tr-TR",{ hour:"2-digit", minute:"2-digit" })
    });
  });

  socket.on("chatMessage", (msg) => {
    // yasaklı kelime kontrol
    if(bannedWords.some(word => msg.content.toLowerCase().includes(word))) {
      socket.emit("kicked", { reason: "Küfür kullandığınız için atıldınız." });
      socket.disconnect();
      return;
    }

    // Quiz cevabı kontrolü
    if(currentQuestion && !answered && msg.content.toLowerCase() === currentQuestion.a.toLowerCase()) {
      answered = true;
      io.emit("chatMessage", {
        username: "SevimliKedicik",
        role: "bot",
        content: `Tebrikler ${msg.username}! Doğru cevabı bildiniz 🎉`,
        time: new Date().toLocaleTimeString("tr-TR",{ hour:"2-digit", minute:"2-digit" })
      });
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

// =====================
// BOTU BAŞLAT
// =====================
sendQuizQuestion();

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
