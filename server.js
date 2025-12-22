// =====================
// Sevimli-Kedicik BOT AYARLARI
// =====================
const BOT_NAME = "Sevimli-Kedicik";
const QUESTION_INTERVAL = 15000; // 15 saniye
let currentQuestion = null;
let currentTimeout = null;
let answered = false;

const questions = [
  { q: "İnsan DNA'sında kaç baz çifti bulunur?", a: "3 milyar" },
  { q: "Dünyada en uzun süre tahtta kalan monark kimdir?", a: "louis xiv" },
  { q: "Einstein'ın izafiyet teorisini hangi yılda yayınladı?", a: "1905" },
  { q: "Newton'un hareket yasalarından üçüncüsü nedir?", a: "etki-tepki" },
  { q: "Plüton gezegeni hangi yılda gezegen statüsünden çıkarıldı?", a: "2006" },
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
  { q: "En uzun süre tahtta kalan İngiliz monark kimdir?", a: "Kraliçe II. Elizabeth" },
  { q: "Güneş’te hangi gaz en fazla bulunur?", a: "Hidrojen" },
  { q: "Dünyanın en büyük gölü hangisidir?", a: "Hazar Gölü" },
  { q: "Mona Lisa tablosunu kim yapmıştır?", a: "Leonardo da Vinci" },
  { q: "Bir ışık yılı kaç kilometredir?", a: "9.461 trilyon km" },
  { q: "İlk insanlı uzay uçuşunu gerçekleştiren kimdir?", a: "Yuri Gagarin" },
  { q: "Dünyadaki en hızlı kara hayvanı hangisidir?", a: "Çita" },
];

// Soruyu gönderme fonksiyonu
function sendNextQuestion(io) {
  answered = false;

  // Rastgele soru seç
  let nextQuestion;
  do {
    nextQuestion = questions[Math.floor(Math.random() * questions.length)];
  } while (currentQuestion && nextQuestion.q === currentQuestion.q);

  currentQuestion = nextQuestion;

  io.emit("chatMessage", {
    username: BOT_NAME,
    role: "bot",
    content: "Hazırsanız soru geliyor: " + currentQuestion.q,
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
  });

  currentTimeout = setTimeout(() => {
    if (!answered) {
      io.emit("chatMessage", {
        username: BOT_NAME,
        role: "bot",
        content: "Süre doldu! Doğru cevap: " + currentQuestion.a,
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      });
    }
    sendNextQuestion(io);
  }, QUESTION_INTERVAL);
}

// Cevap kontrolü (chatMessage event içinde)
function checkAnswer(msg, io) {
  if (currentQuestion && !answered && msg.content.toLowerCase() === currentQuestion.a.toLowerCase()) {
    answered = true;

    io.emit("chatMessage", {
      username: BOT_NAME,
      role: "bot",
      content: `Tebrikler ${msg.username}! Doğru cevabı bildiniz 🎉`,
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    });

    clearTimeout(currentTimeout);
    setTimeout(() => sendNextQuestion(io), QUESTION_INTERVAL);
    return true;
  }
  return false;
}
