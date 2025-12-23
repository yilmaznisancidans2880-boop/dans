const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "https://www.turkgptchat.com" },
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

// bot listesi (Türkçe ve yabancı isimler karışık, 100 adet)
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

// bot mesajları (doğal sohbet havası)
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
  "Ozan biraz sessiz ama belli ki kafasında çok şey var",
  "Deniz her zamanki gibi ortama neşe katıyor",
  "Elif senin gülüşün bile buraya yansıyor gibi 😊",
  "Mert bugün baya keyifli görünüyor",
  "Ayşe sakinliğiyle insanı rahatlatıyor",
  "Can konuşmasa bile varlığı yetiyor",
  "Zeynep yine pozitifliğini konuşturmuş",
  "Emre her zamanki gibi düşünceli",
  "Seda enerjisiyle sohbeti canlandırıyor",
  "Baran bugün biraz dalgın sanki",
  "Ece neşesini hiç kaybetmiyor",
  "Kerem lafı uzatmadan net konuşuyor",
  "Selin ortamı çok güzel toparlıyor",
  "Tunç her zamanki gibi kendinden emin",
  "Derya konuşunca insan dinlemek istiyor",
  "Yasemin çok nazik cümleler kuruyor",
  "Berk biraz yorgun ama yine de burada",
  "Melis’in enerjisi bulaşıcı gerçekten",
  "Kaan sessiz ama derin biri",
  "Aylin pozitifliğiyle ortamı yumuşatıyor",
  "Onur her zaman mantıklı yaklaşıyor",
  "Cem yine güzel bir konu açmış",
  "İpek senin bu enerjini koruman lazım",
  "Burak her zamanki gibi rahat",
  "Gamze gülünce ortam aydınlanıyor",
  "Arda bugün biraz düşünceli",
  "Funda sakinliğiyle iyi geliyor",
  "Ege’nin muhabbeti ayrı bir keyif",
  "Nazlı detayları iyi yakalıyor",
  "Ozan bazen sessiz kalıyor ama içi dolu",
  "Selma konuşurken insanı yormuyor",
  "Liam bugün baya enerjik",
  "Emma sohbeti güzel yönlendiriyor",
  "Noah sakin ama net",
  "Olivia her zamanki gibi pozitif",
  "Aiden ortamın havasını değiştirdi",
  "Sophia çok zarif konuşuyor",
  "Lucas lafı tam yerinde söylüyor",
  "Mia enerjisiyle dikkat çekiyor",
  "Ethan düşünmeden konuşmuyor",
  "Isabella sohbeti yumuşatıyor",
  "Mason bugün biraz dalgın",
  "Charlotte her zamanki gibi nazik",
  "Logan lafı uzatmadan anlatıyor",
  "Amelia ortamı toparlıyor",
  "James netliğiyle öne çıkıyor",
  "Harper enerjisiyle fark yaratıyor",
  "Benjamin bugün keyifli belli",
  "Evelyn konuşurken insan dinlemek istiyor",
  "Jacob sakinliğiyle iyi geliyor",
  "Abigail pozitifliğiyle ortamı ısıtıyor",
  "Michael her zamanki gibi ciddi",
  "Emily sohbeti tatlı hale getiriyor",
  "Alexander kendinden emin duruyor",
  "Ella güleryüzlü mesajlar atıyor",
  "Daniel biraz yorgun ama burada",
  "Scarlett çok güzel ifade ediyor kendini",
  "Matthew ortamı iyi gözlemliyor",
  "Grace konuşurken huzur veriyor",
  "Henry lafı dolandırmıyor",
  "Chloe enerjisiyle dikkat çekiyor",
  "William her zamanki gibi ağır başlı",
  "Victoria çok zarif bir üslup kullanıyor",
  "Jackson net ve açık konuşuyor",
  "Lily sohbeti yumuşatıyor",
  "Sebastian kendinden emin duruyor",
  "Aria ortama renk katıyor",
  "David fazla konuşmasa da etkili",
  "Hannah pozitifliğiyle fark ediliyor",
  "Joseph sakinliğiyle denge sağlıyor",
  "Zoe enerjisiyle sohbeti canlandırıyor",
  "Samuel biraz düşünceli ama iyi",
  "Nora çok samimi konuşuyor",
  "Owen ortamı iyi takip ediyor",
  "Aurora çok tatlı bir enerji yayıyor",
  "Gabriel konuşurken güven veriyor",
  "Penelope detaylara dikkat ediyor",
  "Carter sohbeti hareketlendirdi",
  "Hazel çok sıcak konuşuyor",
  "Wyatt net ve sade",
  "Violet enerjisiyle fark yaratıyor",
  "Dylan rahat tavrıyla iyi gidiyor",
  "Claire konuşurken yormuyor",
  "Leo sessiz ama güçlü",
  "Stella pozitifliğiyle ortamı yumuşatıyor",
  "Nathan lafı uzatmadan anlatıyor",
  "Addison enerjisiyle dikkat çekiyor",
  "Julian sakinliğiyle denge kuruyor",
  "Lucy çok tatlı mesajlar atıyor",
  "Caleb bugün keyifli görünüyor",
  "Elena konuşurken samimi",
  "Ryan rahat tavrıyla iyi gidiyor",
  "Ruby enerjisiyle ortamı canlandırıyor",
  "Christian düşünerek konuşuyor",
  "Alice çok nazik bir üslup kullanıyor",
  "Jonathan sakinliğiyle fark ediliyor",
  "Sadie güleryüzlü mesajlar yazıyor",
  "Hunter net ve açık konuşuyor",
  "Luna enerjisiyle dikkat çekiyor",
  "Eli sessiz ama yerinde",
  "Paisley konuşurken ortamı yumuşatıyor",
  "Yeni bir hobiye başlamak istiyorum.",
  "Sebastian kendinden emin duruyor",
  "Aria ortama renk katıyor",
  "David fazla konuşmasa da etkili",
  "Hannah pozitifliğiyle fark ediliyor",
  "Joseph sakinliğiyle denge sağlıyor",
  "Zoe enerjisiyle sohbeti canlandırıyor",
  "Bugün güneş o kadar güzel doğdu ki, izlerken kahvemi döktüm neredeyse 😅",
  "Sizce en güzel kahvaltı hangisi, pancake mi yoksa menemen mi?",
  "Küçük bir yürüyüş yaptım, doğanın sesleri insanı gerçekten rahatlatıyor.",
  "Komik bir anı hatırladım, hala gülmekten kırılıyorum 😂",
  "Bazen hiçbir şey yapmadan oturmak, ruhu dinlendiriyor.",
  "Yeni bir şarkı keşfettim, ritmi günümü değiştirdi.",
  "Arkadaşımın anlattığı fıkra çok komikti, kahkaha attım 😆",
  "Bugün kendime küçük bir ödül verdim, kendimi şımartmak iyi geldi.",
  "Dışarıda yağmur yağıyor ama içim sıcacık bir hisle doldu ☔️",
  "Bazen en güzel sohbet, sadece susmak ve dinlemekmiş gibi geliyor.",
  "Kendi kendime şaka yaptım, bir süre kendimle eğlendim 😂",
  "Sabah kahvemi balkonda içmek, ruhuma iyi geldi.",
  "Yeni bir film izledim, karakterlerin hikayesi beni etkiledi.",
  "Arkadaşlarımla oyun oynadım, çok eğlendik.",
  "Bazen sadece bir kitapla baş başa kalmak, günün stresini alıyor.",
  "Bugün enerjim yüksek, sanırım güneşten kaynaklanıyor ☀️",
  "Siz de bazen eski şarkıları açıp geçmişi hatırlıyor musunuz?",
  "Evde küçük bir temizlik yaptım, ferahlık hissi çok iyi geldi.",
  "Komik bir video izledim, kahkaha krizine girdim 😂",
  "Balkonda oturup çay içmek, küçük bir meditasyon gibi.",
  "Biraz yürüyüş yaptım, rüzgar yüzümü okşadı.",
  "Hayat küçük şeylerden ibaret, bazen bir gülüş bile yeterli.",
  "Küçük bir not aldım, kendime hatırlatıcı olsun diye.",
  "Bugün biraz resim yaptım, renklerle oynamak çok iyi geldi.",
  "Arkadaşım bana eski bir anıyı hatırlattı, nostalji patlaması yaşadım.",
  "Kendi kendime şarkı söyledim, ruhum açıldı 🎶",
  "Evde hafif müzik açtım, kafam dağıldı.",
  "Bazen sadece sessizlik yeterli, kelimelere gerek yok.",
  "Gününüzü paylaşmak ister misiniz, küçük mutluluklar önemli 💛",
  "Yeni bir tatlı denedim, beklediğimden lezzetli çıktı 😋",
  "Arkadaşımla sohbet ettik, günümüz çok keyifli geçti.",
  "Dışarıda kuşlar ötmeye başlamış, manzara çok huzurlu.",
  "Bazen sadece gülmek insanın ruhunu hafifletiyor.",
  "Kısa bir meditasyon yaptım, kendimi yeniden buldum.",
  "Eski fotoğraflara bakmak, anıları canlandırıyor.",
  "Bugün kendime küçük bir hediye aldım, mutlu oldum.",
  "Arkadaşımın anlattığı hikaye çok komikti, gülmekten karnım ağrıdı 😂",
  "Balkonda oturup manzarayı izlemek huzur vericiymiş.",
  "Kendi kendime yazı yazdım, düşüncelerimi toparladım.",
  "Yeni bir podcast dinledim, ilginç bilgiler öğrendim.",
  "Bazen en iyi terapi, bir fincan kahve ve sessizlikmiş ☕️",
  "Evde kısa bir egzersiz yaptım, enerji doldu.",
  "Arkadaşlarınız size küçük bir sürpriz yapsa, gününüz nasıl değişirdi sizce?",
  "Bugün kendimi çok enerjik hissediyorum, sanırım spor yapmam iyi geldi.",
  "Eski bir şarkıyı açtım, hatıralar canlandı.",
  "Küçük bir çikolata molası verdim, mutluluk anı gibi 😋",
  "Evde minik bir organizasyon yaptım, çok eğlenceliydi.",
  "Bazen sadece doğaya bakmak, insanı yeniliyor.",
  "Arkadaşımın anlattığı anı çok komikti, hala gülüyorum 😂",
  "Bugün biraz yazı yazdım, kafamı boşalttım.",
  "Evde hafif bir temizlik yaptım, ferah bir ortam oluştu.",
  "Kendi kendime şaka yaptım, gülmekten eğlendim.",
  "Balkonda hafif bir esinti vardı, keyif aldım.",
  "Yeni bir oyun denedim, eğlenceliydi.",
  "Arkadaşlarla küçük bir yarış yaptık, çok güldük.",
  "Kendi kendime dans ettim, ruhum açıldı 💃",
  "Bahçede yürüdüm, doğa çok güzeldi.",
  "Evde kısa bir çay partisi yaptım, keyifliydi.",
  "Bugün kendimi biraz şımarttım, harika hissettim.",
  "Kısa bir meditasyon yaptım, sakinleştim.",
  "Arkadaşlarınız size moral verse, nasıl hissederdiniz?",
  "Bazen en iyi fikirler yürürken gelir, siz de öyle hissediyor musunuz?",
  "Evde hafif bir temizlik yaptım, ferah bir ortam oluştu.",
  "Arkadaşımın anlattığı anı çok güldürdü.",
  "Gününüzü güzel geçirmek için küçük bir ritüeliniz var mı?",
  "Kahve molası verdim, ruhum canlandı.",
  "Biraz eski videolar izledim, çok eğlendim.",
  "Balkonda oturup güneşi izledim, huzur doldu.",
  "Yeni bir tatlı tarifi denedim, sonuç muhteşem 😋",
  "Arkadaşımın anlattığı fıkra çok komikti, kahkaha attık 😂",
  "Bugün küçük bir hedef koydum, motive oldum.",
  "Biraz kitap okudum, kafam açıldı.",
  "Kendi kendime şarkı söyledim, eğlenceliydi.",
  "Evde hafif bir müzik açtım, kafam dağıldı.",
  "Bazen sadece sessizlik çok iyi geliyor.",
  "Küçük bir kahve molası verdim, keyif aldım.",
  "Arkadaşlarım anlattı, birlikte kahve içiyormuşuz gibi hissettim.",
  "Eski bir film açtım, nostalji yaşadım.",
  "Evde hafif bir egzersiz yaptım, enerji doldu.",
  "Arkadaşlarım bana küçük bir sürpriz yaptı, günüm güzelleşti.",
  "Balkonda oturup çiçekleri izledim, çok huzurluydu.",
  "Kendi kendime küçük bir not yazdım, hatırlatıcı olsun diye.",
  "Bugün kendime küçük bir ödül verdim, mutlu oldum.",
  "Komik bir mesaj aldım, gülmekten kendimle eğlendim.",
  "Evde yeni bir oyun denedim, çok eğlenceliydi.",
  "Biraz eski şarkıları açtım, nostalji yaptım.",
  "Arkadaşlarla kısa bir sohbet ettik, günümüz çok keyifli geçti.",
  "Kendi kendime dans ettim, ruhum açıldı.",
  "Bahçede yürüyüş yaptım, doğa harikaydı.",
  "Evde küçük bir çay partisi yaptım, keyifliydi.",
  "Bugün kendimi şımarttım, harika hissettim."
];

// bot kullanıcılarını ekle
botNames.forEach(name => {
  users.push({ id: `bot_${name}`, username: name, role: "bot" });
});

// Türkiye saati fonksiyonu
function getTurkeyTime() {
  return new Date().toLocaleTimeString("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

// botlar arası sohbet için fonksiyon
function randomBotChat() {
  if(users.filter(u => u.role === "bot").length === 0) return;

  const botUser = users.filter(u => u.role === "bot")[Math.floor(Math.random() * botNames.length)];
  const botMessage = botMessages[Math.floor(Math.random() * botMessages.length)];

  const msg = {
    username: botUser.username,
    role: "bot",
    content: botMessage,
    time: getTurkeyTime()
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

    // Her kullanıcı giriş yaptığında tüm kullanıcıları güncelle
    io.emit("users", users);

    io.emit("chatMessage", {
      username: "Sistem",
      role: "admin",
      content: `${username} sohbete katıldı 👋`,
      time: getTurkeyTime()
    });
  });

  socket.on("chatMessage", (msg) => {
    if(bannedWords.some(word => msg.content.toLowerCase().includes(word))) {
      socket.emit("kicked", { reason: "Küfür kullandığınız için atıldınız." });
      socket.disconnect();
      return;
    }
    messages.push(msg);
    io.emit("chatMessage", { ...msg, time: getTurkeyTime() });
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
      // Çıkınca da tüm kullanıcıları güncelle
      io.emit("users", users);

      io.emit("chatMessage", {
        username:"Sistem",
        role:"admin",
        content:`${user.username} sohbetten ayrıldı 🚪`,
        time: getTurkeyTime()
      });
    }
    console.log("🔴 Ayrıldı:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));




