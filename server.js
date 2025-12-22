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
let questionIndex = 0;

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
  Mona Lisa tablosu hangi müzede sergileniyor?", a: "Louvre" },
{ q: "Van Gogh hangi tabloda geceyi tasvir etti?", a: "Yıldızlı Gece" },
{ q: "Michelangelo Sistine Şapeli tavanını hangi şehirde boyadı?", a: "Roma" },
{ q: "Leonardo da Vinci'nin ünlü son akşam yemeği tablosu hangi şehirde?", a: "Milano" },
{ q: "Picasso hangi akımı başlatmıştır?", a: "Kübizm" },
{ q: "Salvador Dali’nin eriyen saatlerini tasvir ettiği tablo nedir?", a: "Azrailin Belleği" },
{ q: "Claude Monet’nin bahçesini resmettiği ünlü eser serisi nedir?", a: "Nilüferler" },
{ q: "Rembrandt hangi ülkede yaşamıştır?", a: "Hollanda" },
{ q: "Edvard Munch’un ünlü çığlık tablosu hangi ülkede yapıldı?", a: "Norveç" },
{ q: "Frida Kahlo hangi ülkeden ünlü bir ressamdır?", a: "Meksika" },
{ q: "Gustav Klimt’in Altın Çağ tablosunda hangi teknik kullanılmıştır?", a: "Altın yaprak" },
{ q: "Jackson Pollock hangi tarzda resim yapmıştır?", a: "Soyut dışavurumculuk" },
{ q: "Andy Warhol hangi akımı temsil eder?", a: "Pop Art" },
{ q: "Georgia O'Keeffe hangi bitkiyi sıkça resmetmiştir?", a: "Çiçekler" },
{ q: "Henri Matisse’in ünlü kesme kağıt tekniği nedir?", a: "Cut-outs" },
{ q: "Caravaggio hangi ışık tekniğini kullanmıştır?", a: "Chiaroscuro" },
{ q: "Johannes Vermeer’in ünlü eseri olan 'İnci Küpeli Kız' hangi ülkede yapılmıştır?", a: "Hollanda" },
{ q: "Rafael hangi dönemde ressamdır?", a: "Rönesans" },
{ q: "Hieronymus Bosch’un ünlü fantastik tablosu nedir?", a: "Dünya Cehennemi ve Cennet" },
{ q: "Jean-Michel Basquiat hangi akımın öncüsüdür?", a: "Neo-Expressionism" },
{ q: "Edgar Degas hangi türü resmetmiştir?", a: "Balerinler" },
{ q: "Jan van Eyck’in ünlü eseri nedir?", a: "Arnolfini Portresi" },
{ q: "Marc Chagall hangi renkleri sıkça kullanmıştır?", a: "Mavi ve kırmızı" },
{ q: "Goya hangi ülkenin ressamıdır?", a: "İspanya" },
{ q: "Diego Rivera hangi tarzda eserler yapmıştır?", a: "Duvar resimleri ve fresk" },
{ q: "Kandinsky hangi akımı başlatmıştır?", a: "Soyut sanat" },
{ q: "Paul Cézanne hangi manzaraları resmetmiştir?", a: "Mont Sainte-Victoire" },
{ q: "René Magritte hangi tür eserleriyle ünlüdür?", a: "Sürrealizm" },
{ q: "Edouard Manet’nin ünlü tablosu nedir?", a: "Olympia" },
{ q: "Titian hangi dönemin ressamıdır?", a: "Rönesans" },
{ q: "Vermeer hangi ışık oyunlarıyla tanınır?", a: "Doğal ışık kullanımı" },
{ q: "Auguste Rodin’in ünlü heykeli nedir?", a: "Düşünen Adam" },
{ q: "Michelangelo’nun Davut heykeli hangi şehirde bulunur?", a: "Floransa" },
{ q: "Gustav Courbet hangi akımı temsil eder?", a: "Realizm" },
{ q: "Hokusai’nin ünlü eseri nedir?", a: "Büyük Dalga" },
{ q: "Katsushika hangi ülkeden bir sanatçıdır?", a: "Japonya" },
{ q: "Francisco de Zurbarán hangi ülkede yaşamıştır?", a: "İspanya" },
{ q: "Albrecht Dürer hangi dönemin sanatçısıdır?", a: "Rönesans" },
{ q: "El Greco hangi ülkede eser vermiştir?", a: "İspanya" },
{ q: "Die Brücke hangi ülkenin sanat hareketidir?", a: "Almanya" },
{ q: "Wassily Kandinsky’nin ilk soyut eserlerinden biri nedir?", a: "Kompozisyon VII" },
{ q: "Paul Klee hangi ülkenin ressamıdır?", a: "İsviçre" },
{ q: "Henri Rousseau hangi tarzda eserler yapmıştır?", a: "Naif sanat" },
{ q: "Edward Hopper hangi temaları resmetmiştir?", a: "Yalnızlık ve şehir yaşamı" },
{ q: "Pierre-Auguste Renoir hangi konuları sıkça işlemiştir?", a: "Portre ve manzara" },
{ q: "John Constable hangi doğa manzaralarıyla ünlüdür?", a: "İngiliz kırsalı" },
{ q: "Caspar David Friedrich hangi dönemde çalışmıştır?", a: "Romantizm" },
{ q: "Tamara de Lempicka hangi tarzda eser yapmıştır?", a: "Art Deco" },
{ q: "Édouard Vuillard hangi teknikle çalışmıştır?", a: "Dekoratif post-empresyonizm" },
{ q: "Marcel Duchamp’ın ünlü eseri nedir?", a: "Fountain" },
{ q: "Fernand Léger hangi akımı temsil eder?", a: "Modernizm" },
{ q: "Marc Rothko’nun ünlü eserlerinde hangi renk tonları öne çıkar?", a: "Kırmızı ve turuncu" },
{ q: "Henri de Toulouse-Lautrec hangi tür sahneleri resmetmiştir?", a: "Kabare ve tiyatro" },
{ q: "Élisabeth Vigée Le Brun hangi ülkenin ressamıdır?", a: "Fransa" },
{ q: "Diego Velázquez hangi dönemin ressamıdır?", a: "Barok" },
{ q: "Giacomo Balla hangi akımı temsil eder?", a: "Fütürizm" },
{ q: "Umberto Boccioni hangi tür eserler yapmıştır?", a: "Heykel ve resim" },
{ q: "František Kupka hangi akımı başlatmıştır?", a: "Soyut sanat" },
{ q: "Jean Dubuffet hangi tarzı yaratmıştır?", a: "Art Brut" },
{ q: "Louise Bourgeois hangi türde ünlüdür?", a: "Heykel" },
{ q: "Joseph Beuys hangi kavramı ön plana çıkarmıştır?", a: "Performans sanatı" },
{ q: "Barbara Hepworth hangi ülkeden bir heykeltıraştır?", a: "İngiltere" },
{ q: "Alexander Calder hangi tür eserleriyle tanınır?", a: "Mobilye heykelleri" },
{ q: "Joan Miró hangi akımı temsil eder?", a: "Sürrealizm" },
{ q: "René Lalique hangi tür tasarımlarıyla ünlüdür?", a: "Cam ve mücevher" },
{ q: "Gustav Klimt’in en ünlü portresi nedir?", a: "Öpücük" },
{ q: "Edvard Munch’un başka ünlü eseri nedir?", a: "Madonna" },
{ q: "Frida Kahlo hangi eseriyle kendini resmetmiştir?", a: "İki Frida" },
{ q: "Georgia O’Keeffe’nin çiçekleri hangi teknikle yapılır?", a: "Yağlı boya" },
{ q: "Hokusai’nin dalgaları hangi teknikle yapılmıştır?", a: "Ahşap baskı" },
{ q: "Katsushika Hokusai’nin ünlü eseri hangi sanat akımıyla ilişkilidir?", a: "Ukiyo-e" },
{ q: "Leonardo da Vinci hangi bilim dalına ilgi göstermiştir?", a: "Anatomi" },
{ q: "Michelangelo hangi yapıyı heykel ve resimle tamamlamıştır?", a: "Sistine Şapeli" },
{ q: "Raphael’in en ünlü eseri nedir?", a: "Atina Okulu" },
{ q: "Caravaggio hangi tür konuları işlemiştir?", a: "Dini sahneler" },
{ q: "Titian’in ünlü portresi nedir?", a: "Venüs of Urbino" },
{ q: "Jan van Eyck hangi tabloyla ünlüdür?", a: "Arnolfini Portresi" },
{ q: "Vermeer’in ışık kullanımı hangi şehirle ilişkilidir?", a: "Delft" },
{ q: "Goya hangi eserinde korku ve savaş teması kullanmıştır?", a: "3 Mayıs 1808" },
{ q: "Die Brücke akımı hangi şehirden çıkmıştır?", a: "Dresden" },
{ q: "Paul Cézanne’nin natürmortları hangi tarzdadır?", a: "Empresyonist" },
{ q: "Kandinsky hangi eserinde renkleri müzik gibi kullanmıştır?", a: "Composition VIII" },
{ q: "Edward Hopper’ın ünlü eseri nedir?", a: "Nighthawks" },
{ q: "Auguste Rodin’in başka ünlü heykeli nedir?", a: "Öpücük" },
{ q: "Marc Chagall hangi tür resimleriyle tanınır?", a: "Sürreal ve rüya gibi" },
{ q: "René Magritte’in meşhur eseri nedir?", a: "İhanet" },
{ q: "Tamara de Lempicka hangi ülkenin Art Deco ressamıdır?", a: "Polonya" },
{ q: "Louise Bourgeois’in ünlü heykeli nedir?", a: "Ağı" },
{ q: "Marcel Duchamp’ın başka ünlü eseri nedir?", a: "Bicycle Wheel" },
{ q: "Joan Miró hangi renkleri sıkça kullanır?", a: "Kırmızı, sarı, mavi" },
{ q: "Andy Warhol hangi popüler ikonları resmetmiştir?", a: "Marilyn Monroe" },
{ q: "Banksy hangi tür sanatıyla tanınır?", a: "Sokak sanatı" },
{ q: "Damien Hirst hangi tür eserleriyle ünlüdür?", a: "Kontemprorary heykel" },
{ q: "Jeff Koons hangi popüler heykeli yaptı?", a: "Balon Köpek" },
{ q: "Yayoi Kusama hangi temaları işler?", a: "Noktalar ve sonsuzluk" },
{ q: "Takashi Murakami hangi renkleri sıkça kullanır?", a: "Parlak renkler" },
];

let currentQuestion = null;
let answered = false;
let questionTimer = null;

function sendNextQuestion() {
  answered = false;
  currentQuestion = questions[questionIndex];

  io.emit("chatMessage", {
    username: BOT_NAME,
    role: "bot",
    content: "Hazırsanız soru geliyor: " + currentQuestion.q,
    time: new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})
  });

  questionTimer = setTimeout(() => {
    if(!answered){
      io.emit("chatMessage",{
        username: BOT_NAME,
        role: "bot",
        content: "Süre doldu! Doğru cevap: " + currentQuestion.a,
        time: new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})
      });
    }
    questionIndex = (questionIndex + 1) % questions.length;
    sendNextQuestion();
  }, QUESTION_INTERVAL);
}

// =====================
// SOCKET.IO BAĞLANTI
// =====================
io.on("connection",(socket)=>{
  console.log("🟢 Bağlandı:", socket.id);

  socket.emit("users", users);
  socket.emit("initMessages", messages);

  socket.on("join",({username,password})=>{
    if(username === "LoverBoy"){
      if(users.some(u=>u.username==="LoverBoy")){
        socket.emit("joinError","LoverBoy nicki zaten kullanılıyor!");
        return;
      }
      if(password !== "3530657Ynz"){
        socket.emit("joinError","LoverBoy şifresi hatalı!");
        return;
      }
    }
    const user={
      id: socket.id,
      username,
      role: username==="LoverBoy"?"admin":"user"
    };
    users.push(user);
    io.emit("users",users);
    io.emit("chatMessage",{
      username:"Sistem",
      role:"admin",
      content:`${username} sohbete katıldı 👋`,
      time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})
    });
  });

  socket.on("chatMessage",(msg)=>{
    if(bannedWords.some(word=>msg.content.toLowerCase().includes(word))){
      socket.emit("kicked",{reason:"Küfür kullandığınız için atıldınız."});
      socket.disconnect();
      return;
    }

    // Quiz cevabı kontrolü
    if(currentQuestion && !answered && msg.content.toLowerCase() === currentQuestion.a.toLowerCase()){
      answered = true;
      io.emit("chatMessage",{
        username: BOT_NAME,
        role:"bot",
        content:`Tebrikler ${msg.username}! Doğru cevabı bildiniz 🎉`,
        time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})
      });
      clearTimeout(questionTimer);
      setTimeout(sendNextQuestion, QUESTION_INTERVAL);
      return;
    }

    messages.push(msg);
    io.emit("chatMessage",msg);
  });

  socket.on("kickUser",(userId)=>{
    const adminUser = users.find(u=>u.id===socket.id && u.role==="admin");
    if(!adminUser) return;
    const target = users.find(u=>u.id===userId);
    if(target){
      io.to(userId).emit("kicked",{reason:"Admin tarafından atıldınız."});
      io.sockets.sockets.get(userId)?.disconnect();
    }
  });

  socket.on("disconnect",()=>{
    const user=users.find(u=>u.id===socket.id);
    if(user){
      users=users.filter(u=>u.id!==socket.id);
      io.emit("users",users);
      io.emit("chatMessage",{
        username:"Sistem",
        role:"admin",
        content:`${user.username} sohbetten ayrıldı 🚪`,
        time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})
      });
    }
    console.log("🔴 Ayrıldı:",socket.id);
  });
});

// =====================
// BOTU BAŞLAT
// =====================
sendNextQuestion();

const PORT = process.env.PORT || 10000;
server.listen(PORT,()=>console.log(`Server ${PORT} portunda çalışıyor`));
