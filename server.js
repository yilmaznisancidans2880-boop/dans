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
// Sevimli-Kedicik BOT AYARLARI
// =====================
const BOT_NAME = "Sevimli-Kedicik";
const QUESTION_INTERVAL = 15000; // 15 saniye

const questions = [
  { q: "İnsan DNA'sında kaç baz çifti bulunur?", a: "3 milyar" },
  { q: "Dünyada en uzun süre tahtta kalan monark kimdir?", a: "louis xiv" },
  { q: "Einstein'ın izafiyet teorisini hangi yılda yayınladı?", a: "1905" },
  { q: "İnsan vücudundaki en büyük organ hangisidir?", a: "Cilt" },
  { q: "Plüton gezegeni hangi yılda gezegen statüsünden çıkarıldı?", a: "2006" },
  { q: "En uzun süre yaşayan canlı türü hangisidir?", a: "Deniz kestanesi (Ocean quahog)" },
  { q: "Yunan mitolojisinde yer altı tanrısı kimdir?", a: "Hades" },
  { q: "Dünyanın en büyük gölü hangisidir?", a: "Hazar Gölü" },
  { q: "İlk insanlı uzay uçuşunu gerçekleştiren kimdir?", a: "Yuri Gagarin" },
  { q: "Mona Lisa tablosunu kim yapmıştır?", a: "Leonardo da Vinci" },
  { q: "Bir ışık yılı kaç kilometredir?", a: "9.461 trilyon km" },
  { q: "Elektronun keşfi hangi bilim insanına aittir?", a: "J.J. Thomson" },
  { q: "Hangi elementin sembolü Au'dur?", a: "Altın" },
  { q: "Dünya’nın en uzun nehri hangisidir?", a: "Nil" },
  { q: "Güneş sistemi içinde en hızlı gezegen hangisidir?", a: "Merkür" },
  { q: "Hangi gezegenin halkaları vardır?", a: "Satürn" },
  { q: "İnsan beynindeki nöron sayısı yaklaşık olarak kaçtır?", a: "86 milyar" },
  { q: "Dünyadaki en eski yazılı dil hangisidir?", a: "Sümerce" },
  { q: "Benzinli bir motorun ilk icadı hangi yüzyılda olmuştur?", a: "19. yüzyıl" },
  { q: "Hangi hayvanın kalbi en büyüktür?", a: "Mavi balina" },
  { q: "Periyodik tabloda 79. element hangisidir?", a: "Altın" },
  { q: "İlk Nobel Ödülü hangi yılda verildi?", a: "1901" },
  { q: "İnsan vücudundaki en küçük kemik hangisidir?", a: "Üzengi (Stapes)" },
  { q: "Hangi gezegen kırmızı renk ile bilinir?", a: "Mars" },
  { q: "DNA’nın açılımı nedir?", a: "Deoksiribonükleik Asit" },
  { q: "İlk yapay zeka programı kim tarafından yazıldı?", a: "Alan Turing" },
  { q: "Hangi gezegen kendi ekseni etrafında en hızlı döner?", a: "Jüpiter" },
  { q: "Hangi ülke iki kıta üzerinde bulunur?", a: "Türkiye" },
  { q: "Hangi yılda internet halka açıldı?", a: "1991" },
  { q: "En uzun insan kası hangisidir?", a: "Sartorius" },
  { q: "Hangi gezegenin uydusu Titan’dır?", a: "Satürn" },
  { q: "Bir kilometre kaç metredir?", a: "1000" },
  { q: "En küçük gezegen hangisidir?", a: "Merkür" },
  { q: "Hangi element sıvı halde bulunur oda sıcaklığında?", a: "Cıva" },
  { q: "İlk modern olimpiyatlar hangi yılda başladı?", a: "1896" },
  { q: "İnsan vücudundaki toplam kemik sayısı kaçtır?", a: "206" },
  { q: "Hangi gezegenin halkaları yoktur?", a: "Mars" },
  { q: "Dünyanın en derin gölü hangisidir?", a: "Baykal" },
  { q: "İlk cep telefonu hangi yılda icat edildi?", a: "1973" },
  { q: "Hangi elementin sembolü O'dur?", a: "Oksijen" },
  { q: "İlk yapay uydu hangisidir?", a: "Sputnik 1" },
  { q: "Hangi hayvanın dili mavi renktedir?", a: "Takasugu (Mavi balina)" },
  { q: "En uzun süre tahtta kalan İngiliz monark kimdir?", a: "Kraliçe II. Elizabeth" },
  { q: "Güneş’te hangi gaz en fazla bulunur?", a: "Hidrojen" },
  { q: "İnsan vücudundaki en büyük kas hangisidir?", a: "Gluteus maximus" },
  { q: "Hangi yılda Wright kardeşler ilk uçağı uçurdu?", a: "1903" },
  { q: "Hangi ülke 7 kıta ve 5 okyanusa sahip değildir?", a: "Hiçbir ülke" },
  { q: "Hangi gezegenin yüzeyi %95 karbon dioksitten oluşur?", a: "Venüs" },
  { q: "İlk bilgisayar virüsü hangi yılda ortaya çıktı?", a: "1986" },
  { q: "Hangi elementin sembolü Fe'dir?", a: "Demir" },
  { q: "Hangi organ vücutta insülin üretir?", a: "Pankreas" },
  { q: "Dünya'nın en uzun duvarı hangisidir?", a: "Çin Seddi" },
  { q: "Hangi yılda Berlin Duvarı yıkıldı?", a: "1989" },
  { q: "Hangi gezegenin uydusu Europa’dır?", a: "Jüpiter" },
  { q: "İlk yazılı kanunlar hangi uygarlık tarafından yapıldı?", a: "Babiller" },
  { q: "Hangi hayvan uçamayan ama yumurtlayan memelidir?", a: "Ornitorenk" },
  { q: "Dünyadaki en hızlı kara hayvanı hangisidir?", a: "Çita" },
  { q: "Hangi ülke bayrağında kırmızı ve beyaz renkler bulunur?", a: "Türkiye" },
  { q: "Hangi element sıvı halde bulunur oda sıcaklığında?", a: "Cıva" },
  { q: "Dünyadaki en büyük ada hangisidir?", a: "Grönland" },
  { q: "Hangi gezegenin halkaları vardır?", a: "Satürn" },
  { q: "İlk Nobel Kimya Ödülü sahibi kimdir?", a: "Jacobus van 't Hoff" },
  { q: "Hangi gezegenin uydusu Enceladus’tur?", a: "Satürn" },
  { q: "Hangi yılda internet yaygın olarak kullanılmaya başlandı?", a: "1995" },
  { q: "Dünyada en uzun süre yaşayan kuş hangisidir?", a: "Albatros" },
  { q: "Hangi hayvanın kalbi en büyüktür?", a: "Mavi balina" },
  { q: "Hangi elementin sembolü K'dır?", a: "Potasyum" },
  { q: "Dünyadaki en yüksek şelale hangisidir?", a: "Angel Şelalesi" },
  { q: "İlk uçan otomobil hangi yılda tanıtıldı?", a: "2010" },
  { q: "Hangi gezegenin uydusu Titan’dır?", a: "Satürn" },
  { q: "En uzun insan tırnağı kaç santimetredir?", a: "9.1 m" },
  { q: "Hangi gezegenin yüzeyi %96 nitrojen içerir?", a: "Venüs" },
  { q: "İlk programlanabilir bilgisayar hangisidir?", a: "Z3" },
  { q: "Hangi elementin sembolü Hg'dir?", a: "Cıva" },
  { q: "İlk yapay zeka programı kim tarafından yazıldı?", a: "Alan Turing" },
  { q: "Hangi gezegen kendi ekseni etrafında en hızlı döner?", a: "Jüpiter" },
  { q: "Hangi ülke iki kıta üzerinde bulunur?", a: "Türkiye" },
  { q: "Hangi element gaz halinde bulunur oda sıcaklığında?", a: "Helyum" },
  { q: "İlk modern olimpiyatlar hangi yılda başladı?", a: "1896" },
  { q: "Dünyadaki en eski şehir hangisidir?", a: "Jericho" },
  { q: "İlk cep telefonu hangi yılda icat edildi?", a: "1973" },
  { q: "İnsan vücudundaki toplam kemik sayısı kaçtır?", a: "206" },
  { q: "Hangi hayvan uçamayan ama yumurtlayan memelidir?", a: "Ornitorenk" },
  { q: "Hangi elementin sembolü Na'dır?", a: "Sodyum" },
  { q: "En büyük karasal memeli hangisidir?", a: "Fil" },
  { q: "Hangi gezegenin halkaları yoktur?", a: "Mars" },
  { q: "İlk yapay uydu hangisidir?", a: "Sputnik 1" },
  { q: "Hangi elementin sembolü C'dir?", a: "Karbon" },
  { q: "Dünyadaki en hızlı kara hayvanı hangisidir?", a: "Çita" },
  { q: "İlk Nobel Ödülü hangi yılda verildi?", a: "1901" },
  { q: "Hangi gezegenin yüzeyi %95 karbon dioksitten oluşur?", a: "Venüs" },
  { q: "En küçük kemik hangisidir?", a: "Üzengi (Stapes)" },
  { q: "İlk bilgisayar programcısı kimdir?", a: "Ada Lovelace" },
  { q: "Hangi yılda Berlin Duvarı yıkıldı?", a: "1989" },
  { q: "Hangi elementin sembolü P'dir?", a: "Fosfor" }
   { q: "Altının kimyasal sembolü nedir?", a: "Au" },
  { q: "Genel görelilik teorisini kim geliştirdi?", a: "Albert Einstein" },
  { q: "İzlanda'nın başkenti neresidir?", a: "Reykjavik" },
  { q: "Yetişkin insan vücudunda kaç kemik vardır?", a: "206" },
  { q: "Güneş sistemimizdeki en büyük gezegen hangisidir?", a: "Jüpiter" },
  { q: "'Hamlet' oyununu kim yazdı?", a: "William Shakespeare" },
  { q: "Hücrenin enerji santrali nedir?", a: "Mitokondri" },
  { q: "Titanik hangi yıl battı?", a: "1912" },
  { q: "Dünya atmosferinde en bol bulunan gaz hangisidir?", a: "Azot" },
  { q: "Mona Lisa tablosunu kim yaptı?", a: "Leonardo da Vinci" },
  { q: "Dünyadaki en sert doğal madde nedir?", a: "Elmas" },
  { q: "Hangi elementin atom numarası 1'dir?", a: "Hidrojen" },
  { q: "Dünyadaki en büyük okyanus hangisidir?", a: "Pasifik Okyanusu" },
  { q: "Penisilini kim keşfetti?", a: "Alexander Fleming" },
  { q: "En hızlı kara hayvanı hangisidir?", a: "Çita" },
  { q: "Kızıl Gezegen olarak bilinen gezegen hangisidir?", a: "Mars" },
  { q: "En küçük asal sayı hangisidir?", a: "2" },
  { q: "Modern fiziğin babası olarak bilinen kişi kimdir?", a: "Galileo Galilei" },
  { q: "Suyun donma noktası Fahrenheit cinsinden kaçtır?", a: "32" },
  { q: "İnsülin hangi organ tarafından üretilir?", a: "Pankreas" },
  { q: "Dünyanın en uzun nehri hangisidir?", a: "Nil" },
  { q: "'Türlerin Kökeni' kitabını kim yazdı?", a: "Charles Darwin" },
  { q: "İnsan vücudundaki en büyük iç organ hangisidir?", a: "Karaciğer" },
  { q: "Hangi elementin sembolü 'O'dur?", a: "Oksijen" },
  { q: "Boşluktaki ışık hızı (km/s) kaçtır?", a: "299792" },
  { q: "Evrensel çekim yasasını kim formüle etti?", a: "Isaac Newton" },
  { q: "İlk modern olimpiyat oyunları hangi ülkede düzenlendi?", a: "Yunanistan" },
  { q: "Güneşte en çok bulunan gaz hangisidir?", a: "Hidrojen" },
  { q: "İlk başarılı polio aşısını kim geliştirdi?", a: "Jonas Salk" },
  { q: "En fazla aya sahip gezegen hangisidir?", a: "Satürn" },
  { q: "Yeni Zelanda'nın başkenti neresidir?", a: "Wellington" },
  { q: "İnsanda kendini yenileyebilen organ hangisidir?", a: "Karaciğer" },
  { q: "Belirsizlik ilkesi ile tanınan bilim insanı kimdir?", a: "Werner Heisenberg" },
  { q: "Gümüşün kimyasal sembolü nedir?", a: "Ag" },
  { q: "Oda sıcaklığında sıvı olan element hangisidir?", a: "Cıva" },
  { q: "Evrenin en bol bulunan elementi hangisidir?", a: "Hidrojen" },
  { q: "Yıldızlı Gece tablosunu kim yaptı?", a: "Vincent van Gogh" },
  { q: "Güneş sistemindeki en yüksek dağ hangisidir?", a: "Olympus Mons" },
  { q: "Güneşe en yakın gezegen hangisidir?", a: "Merkür" },
  { q: "World Wide Web’i kim icat etti?", a: "Tim Berners-Lee" },
  { q: "Dünyadaki en büyük çöl hangisidir?", a: "Sahara" },
  { q: "En uzun ömürlü hayvan hangisidir?", a: "Okyanus midyesi (Ocean Quahog)" },
  { q: "En sert kaya türü hangisidir?", a: "Elmas" },
  { q: "Elektronu kim keşfetti?", a: "J.J. Thomson" },
  { q: "Safra hangi organ tarafından üretilir?", a: "Karaciğer" },
  { q: "Sofra tuzunun kimyasal formülü nedir?", a: "NaCl" },
  { q: "Doğan Güneş Ülkesi olarak bilinen ülke hangisidir?", a: "Japonya" },
  { q: "Bilgisayarın babası olarak bilinen kişi kimdir?", a: "Charles Babbage" },
  { q: "Dünyadaki en büyük memeli hangisidir?", a: "Mavi Balina" },
  { q: "Hangi gezegenin bir günü, bir yılından daha uzundur?", a: "Venüs" },
  { q: "Kurşunun kimyasal sembolü nedir?", a: "Pb" },
  { q: "Hareket yasalarını kim formüle etti?", a: "Isaac Newton" },
  { q: "Işık Şehri olarak bilinen şehir hangisidir?", a: "Paris" },
  { q: "Dünyada en çok konuşulan dil hangisidir?", a: "Mandarin" },
  { q: "'Aşk ve Gurur' kitabını kim yazdı?", a: "Jane Austen" },
  { q: "Kangurunun anavatanı hangi ülkedir?", a: "Avustralya" },
  { q: "Güneş sistemindeki en küçük gezegen hangisidir?", a: "Merkür" },
  { q: "Atom numarası 79 olan element hangisidir?", a: "Altın" },
  { q: "Okyanusların en derin noktası neresidir?", a: "Mariana Çukuru" },
  { q: "Radyaktiviteyi kim keşfetti?", a: "Henri Becquerel" },
  { q: "Dünya atmosferindeki ana gaz hangisidir?", a: "Azot" },
  { q: "Safrayı hangi organ depolar?", a: "Safra Kesesi" },
  { q: "Evrim teorisi ile tanınan bilim insanı kimdir?", a: "Charles Darwin" },
  { q: "Suyun kaynama noktası kaç °C'dir?", a: "100" },
  { q: "Sabah Yıldızı olarak bilinen gezegen hangisidir?", a: "Venüs" },
  { q: "Telefonu kim icat etti?", a: "Alexander Graham Bell" },
  { q: "Dengeyi kontrol eden insan organı hangisidir?", a: "İç Kulak" },
  { q: "Dünyadaki en büyük ada hangisidir?", a: "Grönland" },
  { q: "Oksijeni kim keşfetti?", a: "Joseph Priestley" },
  { q: "Halkalarıyla ünlü gezegen hangisidir?", a: "Satürn" },
  { q: "'1984' kitabını kim yazdı?", a: "George Orwell" },
  { q: "Dünya kabuğundaki en bol metal hangisidir?", a: "Alüminyum" },
  { q: "Hangi memeli yumurta bırakır?", a: "Ornitorenk" },
  { q: "Potasyumun kimyasal sembolü nedir?", a: "K" },
  { q: "'Guernica' tablosunu kim yaptı?", a: "Pablo Picasso" },
  { q: "Brezilya'nın resmi dili nedir?", a: "Portekizce" },
  { q: "Kağıdı hangi ülke icat etti?", a: "Çin" },
  { q: "Fizikte belirsizlik ilkesini kim geliştirdi?", a: "Werner Heisenberg" },
  { q: "En hızlı deniz canlısı hangisidir?", a: "Yelken Balığı" },
  { q: "Karbon elementinin sembolü nedir?", a: "C" },
  { q: "DNA’nın yapısını kim keşfetti?", a: "Watson ve Crick" },
  { q: "Bitkiler fotosentez için hangi gazı kullanır?", a: "Karbondioksit" },
  { q: "Dünyanın en uzun şelalesi hangisidir?", a: "Angel Şelalesi" },
  { q: "İlk başarılı polio aşısını kim geliştirdi?", a: "Jonas Salk" },
  { q: "Yan yatmış şekilde dönen gezegen hangisidir?", a: "Uranüs" },
  { q: "'Bülbülü Öldürmek' kitabını kim yazdı?", a: "Harper Lee" },
  { q: "En pahalı baharat hangisidir?", a: "Safran" },
  { q: "İnsanlar hangi gazı verir?", a: "Karbondioksit" },
  { q: "Ampulü kim icat etti?", a: "Thomas Edison" },
  { q: "Büyük Çin Seddi hangi ülkeye aittir?", a: "Çin" },
  { q: "Dünyadaki en büyük kuş hangisidir?", a: "Deve Kuşu" },
  { q: "Atom numarası 6 olan element hangisidir?", a: "Karbon" },
  { q: "'İlyada' kitabını kim yazdı?", a: "Homeros" },
  { q: "Büyük Kırmızı Leke hangi gezegende bulunur?", a: "Jüpiter" },
  { q: "İlk mekanik bilgisayarı kim geliştirdi?", a: "Charles Babbage" },
  { q: "Gümüşün kimyasal sembolü nedir?", a: "Ag" },
  { q: "Gece Güneşi Ülkesi olarak bilinen ülke hangisidir?", a: "Norveç" },
  { q: "Elektronu kim keşfetti?", a: "J.J. Thomson" },
  { q: "İnsülin hangi organ tarafından üretilir?", a: "Pankreas" },
  { q: "Afrika’nın en uzun nehri hangisidir?", a: "Nil" },
  { q: "Modern kimyanın babası kimdir?", a: "Antoine Lavoisier" }
  { q: "Einstein'ın izafiyet teorisini hangi yılda yayınladı?", a: "1905" },
  { q: "Okyanusların en derin noktası neresidir?", a: "Mariana Çukuru" },
  { q: "Dünya üzerindeki en büyük çöl hangisidir?", a: "Sahara" },
  { q: "İlk bilgisayar programcısı kimdir?", a: "Ada Lovelace" },
  { q: "Hidrojenin atom numarası kaçtır?", a: "1" },
  { q: "Fotosentez sırasında hangi gaz açığa çıkar?", a: "Oksijen" },
  { q: "Okyanusların en derin noktası neresidir?", a: "Mariana Çukuru" },
  { q: "Dünya üzerindeki en büyük çöl hangisidir?", a: "Sahara" },
  { q: "İlk bilgisayar programcısı kimdir?", a: "Ada Lovelace" },
  { q: "Hidrojenin atom numarası kaçtır?", a: "1" },
  { q: "Fotosentez sırasında hangi gaz açığa çıkar?", a: "Oksijen" }

];

let currentQuestion = null;
let answered = false;
let lastQuestionIndex = -1;

// =====================
// SORU BAŞLATMA FONKSİYONU
// =====================
function askNextQuestion() {
  // Rastgele soru seç, ardışık tekrarı engelle
  let index;
  do {
    index = Math.floor(Math.random() * questions.length);
  } while (index === lastQuestionIndex && questions.length > 1);

  lastQuestionIndex = index;
  currentQuestion = questions[index];
  answered = false;

  io.emit("chatMessage", {
    username: BOT_NAME,
    role: "bot",
    content: "Hazırsanız soru geliyor: " + currentQuestion.q,
    time: new Date().toLocaleTimeString("tr-TR",{ hour:"2-digit", minute:"2-digit" })
  });

  setTimeout(() => {
    if(!answered){
      io.emit("chatMessage", {
        username: BOT_NAME,
        role: "bot",
        content: "Süre doldu! Doğru cevap: " + currentQuestion.a,
        time: new Date().toLocaleTimeString("tr-TR",{ hour:"2-digit", minute:"2-digit" })
      });
    }
    askNextQuestion(); // sonraki soru
  }, QUESTION_INTERVAL);
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
    if(bannedWords.some(word => msg.content.toLowerCase().includes(word))) {
      socket.emit("kicked", { reason: "Küfür kullandığınız için atıldınız." });
      socket.disconnect();
      return;
    }

    // Quiz cevabı kontrolü
    if(currentQuestion && !answered && msg.content.toLowerCase() === currentQuestion.a.toLowerCase()){
      answered = true;
      io.emit("chatMessage", {
        username: BOT_NAME,
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
askNextQuestion();

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
