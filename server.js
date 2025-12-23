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
  "Cem", "İpek", "Burak", "Gamze", "Arda", "Funda", "Ege", "Nazlı", "Ozan", "Selma",
  "Liam", "Emma", "Noah", "Olivia", "Aiden", "Sophia", "Lucas", "Mia", "Ethan", "Isabella",
  "Mason", "Charlotte", "Logan", "Amelia", "James", "Harper", "Benjamin", "Evelyn", "Jacob", "Abigail",
  "Michael", "Emily", "Alexander", "Ella", "Daniel", "Scarlett", "Matthew", "Grace", "Henry", "Chloe",
  "William", "Victoria", "Jackson", "Lily", "Sebastian", "Aria", "David", "Hannah", "Joseph", "Zoe",
  "Samuel", "Nora", "Owen", "Aurora", "Gabriel", "Penelope", "Carter", "Hazel", "Wyatt", "Violet",
  "Dylan", "Claire", "Leo", "Stella", "Nathan", "Addison", "Julian", "Lucy", "Caleb", "Elena",
  "Ryan", "Ruby", "Christian", "Alice", "Jonathan", "Sadie", "Hunter", "Luna", "Eli", "Paisley"
];

// bot mesajları
const botMessages = [
 "Selam nasılsınız?", "Bugün hava çok güzel değil mi?", "Yeni bir şarkı keşfettim!", 
  "Dans etmeyi sever misiniz?", "Herkese iyi akşamlar!", "Film öneriniz var mı?", 
  "Son zamanlarda ne izlediniz?", "Merhaba!", "Gününüz nasıl geçiyor?", "Bu sohbet harika!",
  "Ben kahve mi çay mı tercih ediyorsunuz merak ediyorum.", "Bence bu hafta çok hızlı geçti.", 
  "Dışarıda kar yağıyor mu sizde?", "Yeni bir diziye başladım, çok heyecanlı!", 
  "Müziğin ruh halimizi değiştirdiğine inanıyorum.", "Bugün kendimi çok enerjik hissediyorum.", 
  "Arkadaşlarınızla buluştunuz mu bu hafta?", "Biraz spor yapmak iyi geliyor bana.", 
  "Siz de kitap okumayı seviyor musunuz?", "Günaydın, herkes iyi uyudu mu?", 
  "Hafta sonu planınız var mı?", "Geçen gün çok güzel bir film izledim.", 
  "Bu aralar en sevdiğiniz yemek nedir?", "Herkesin keyfi yerinde umarım.", 
  "Hava soğuk ama güneşli, garip değil mi?", "Bazen sadece sessizlik lazım geliyor.", 
  "Bir kahve molası iyi olurdu şimdi.", "Yeni bir oyun denediniz mi?", 
  "Sosyal medyada çok zaman geçiriyorum ama biraz azaltmak istiyorum.", 
  "Arkadaşlarım bana yeni bir mekan önerdi.", "Hayat bazen gerçekten hızlı geçiyor.", 
  "Bugün kendinize zaman ayırdınız mı?", "Hep birlikte online bir oyun oynasak mı?", 
  "Küçük bir yürüyüş yapmayı düşünüyorum.", "Bu hafta çok yoğundum ama şimdi rahatım.", 
  "Bazen sadece müzik dinlemek yeterli.", "Yeni bir dil öğrenmeyi düşünüyorum.", 
  "En son ne zaman sinemaya gittiniz?", "Hayat küçük şeylerden ibaret bazen.", 
  "Bu sohbet çok keyifli, teşekkürler!", "Yeni bir tarif denedim, harikaydı!", 
  "Arkadaşlarınızla güzel anılar biriktirdiniz mi?", "Şu an dışarıda yağmur yağıyor.", 
  "Bugün kendimi motive hissediyorum.", "Hafta sonu planlarınız değişti mi?", 
  "Sizce tatil için en iyi yer neresi?", "Bu aralar çok kitap okuyorum.", 
  "Gününüzü nasıl geçirdiniz?", "Yeni bir müzik albümü keşfettim.", 
  "Bazen sadece yürüyüş yapmak iyi geliyor.", "Arkadaşlarınızla oyun oynadınız mı?", 
  "Hangi diziyi önerirsiniz?", "Bugün biraz kendime zaman ayıracağım.", 
  "Kahvaltıda ne yediniz?", "Sizce hafta içi mi yoksa hafta sonu mu daha keyifli?", 
  "Yeni bir hobiye başladım.", "Bazen sadece sohbet etmek yetiyor.", 
  "Gününüz güzel geçiyor umarım.", "Bu hafta çok yoruldum ama mutluyum.", 
  "Dışarı çıkmayı düşünüyor musunuz?", "Bu sohbet gerçekten eğlenceli.", 
  "En son hangi filmi izlediniz?", "Biraz müzik dinleyelim mi?", 
  "Hava bugün çok güzel, pencereyi açtım.", "Yeni bir mekan keşfettim.", 
  "Arkadaşlarla buluşmak harika oluyor.", "Kendinizi iyi hissetmek önemli.", 
  "Bazen tek ihtiyacımız bir kahve.", "Gününüzü daha verimli yapmak için ne yaptınız?", 
  "Bu aralar en sevdiğiniz şarkı hangisi?", "Bazen sadece yürüyüş yapmak iyi geliyor.", 
  "Yeni bir uygulama keşfettim, çok kullanışlı.", "Bugün kendime küçük bir ödül verdim.", 
  "Siz de kahve mi çay mı tercih ediyorsunuz?", "Arkadaşlarınızla neler konuştunuz?", 
  "Gününüzü paylaşmak ister misiniz?", "Yeni bir şeyler denemek iyi hissettiriyor.", 
  "Bu hafta çok fazla iş yaptım ama keyifliydi.", "Herkese iyi akşamlar dilerim.", 
  "Bazen sadece sessizlik çok iyi geliyor.", "Yeni bir şarkı öğrendim ve çok hoşuma gitti.", 
  "Bugün biraz spor yapmayı düşünüyorum.", "Herkesin keyfi yerinde umarım.", 
  "Yeni bir kitap keşfettim, çok heyecanlıyım.", "Arkadaşlarınızla plan yaptınız mı?", 
  "Sizce bu hafta nasıl geçti?", "Küçük bir yürüyüş yapmayı planlıyorum.", 
  "Bazen sadece rahatlamak lazım.", "Gününüzü eğlenceli geçirmek önemli.", 
  "Yeni bir oyun oynamayı düşündünüz mü?", "Müziğin ruh halimizi değiştirdiğine inanıyorum.", 
  "Bugün kendimi çok enerjik hissediyorum.", "Hafta sonu planınız hazır mı?", 
  "Film izlemek için öneriniz var mı?", "Bazen sadece kahve molası yeterli oluyor.", 
  "Arkadaşlarla sohbet etmek çok keyifli.", "Gününüz güzel geçsin!", 
  "Yeni bir hobiye başlamak istiyorum.", "Bu sohbet çok keyifli, teşekkürler!"
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
