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
const bannedWords = ["küfür1", "küfür2", "argo1"];

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
  { q: "İnsan vücudundaki en büyük kas hangisidir?", a: "Gluteus maximus" }
  { q: "Dünyadaki en uzun çorap kaç metre olabilir?", a: "21 metre" },
{ q: "Penguenler uçabilir mi?", a: "Hayır" },
{ q: "Hangi hayvan kendi boynunu 3 metre uzatabilir?", a: "Zürafa" },
{ q: "Uzayda kimse sizi duyabilir mi?", a: "Hayır" },
{ q: "Hangi sebze gözleriyle konuşabilir?", a: "Patates" },
{ q: "Dünyadaki en hızlı hayvan hangisidir?", a: "Çita" },
{ q: "Ay yüzeyinde rüzgar eser mi?", a: "Hayır" },
{ q: "Kediler kaç farklı ses çıkarabilir?", a: "Yaklaşık 100" },
{ q: "Bir inek kaç litre süt verebilir günde?", a: "25 litre" },
{ q: "Deniz anası kaç saniye içinde şeffaflaşabilir?", a: "1 saniye" },
{ q: "Timsahlar terler mi?", a: "Hayır" },
{ q: "Hangi meyve uzayda büyüyebilir?", a: "Çilek" },
{ q: "Dünyadaki en uzun tavşan kulağı kaç cm?", a: "31 cm" },
{ q: "Hangi hayvan gözlerini kapatmadan uyur?", a: "At" },
{ q: "Dünyadaki en küçük kemik hangisidir?", a: "Üzengi" },
{ q: "Bir fil kaç litre su içer?", a: "190 litre" },
{ q: "Kangurular geri geri yürüyebilir mi?", a: "Hayır" },
{ q: "Bir deniz yıldızı kaç koluyla yürür?", a: "5" },
{ q: "İneklerin kaç gözü vardır?", a: "2" },
{ q: "Dünyadaki en sessiz hayvan hangisidir?", a: "Baykuş" },
{ q: "Hangi kuş ters uçabilir?", a: "Kolibri" },
{ q: "Bir karınca kaç kilometre yürüyebilir günde?", a: "200 metre" },
{ q: "Kediler neden süt içer?", a: "Lezzetli olduğu için" },
{ q: "Uzayda yemek yenir mi?", a: "Evet" },
{ q: "Hangi hayvan 7 saniyede nefesini tutabilir?", a: "Balina" },
{ q: "Bir tırtıl kaç günde kelebeğe dönüşür?", a: "10-14 gün" },
{ q: "Dünyadaki en uzun örümcek ayağı kaç cm?", a: "30 cm" },
{ q: "Hangi hayvan 3 kalbe sahiptir?", a: "Ahtapot" },
{ q: "Penguenler neden siyah beyazdır?", a: "Kamuflaj için" },
{ q: "Dünyadaki en yaşlı ağaç kaç yaşında?", a: "5000 yıl" },
{ q: "Kediler neden miyavlar?", a: "İletişim için" },
{ q: "Tavşanlar neden kulaklarını dik tutar?", a: "Dikkat için" },
{ q: "Hangi hayvan uçamaz ama kanatları vardır?", a: "Penguen" },
{ q: "Bir karınca hangi ağırlığı taşıyabilir?", a: "Kendi vücut ağırlığının 50 katı" },
{ q: "Dünyadaki en hızlı balık hangisidir?", a: "Yelken balığı" },
{ q: "Fil hortumunu neden kullanır?", a: "Su içmek ve koklamak için" },
{ q: "Hangi hayvan kış uykusuna yatar?", a: "Ayı" },
{ q: "Dünyadaki en küçük kuş hangisidir?", a: "Arı kuşu" },
{ q: "Hangi böcek ay ışığında dans eder?", a: "Ateş böceği" },
{ q: "Bir tavuk kaç yumurta yumurtlayabilir yılda?", a: "300" },
{ q: "Hangi hayvan hiç uyumaz?", a: "Denizanası" },
{ q: "Uzay boşluğunda ses çıkar mı?", a: "Hayır" },
{ q: "Hangi hayvan ters dönebilir?", a: "Yılan" },
{ q: "Dünyadaki en büyük deniz canlısı hangisidir?", a: "Mavi balina" },
{ q: "Hangi meyve 1 ayda olgunlaşır?", a: "Muz" },
{ q: "Kediler neden tırmanır?", a: "Egzersiz ve av için" },
{ q: "Bir inek neden meleyemez?", a: "Yanlış soru, meleyemez çünkü at değil" },
{ q: "Hangi hayvan 1 yıl su içmeden yaşayabilir?", a: "Deve" },
{ q: "Dünyadaki en hızlı kara hayvanı hangisidir?", a: "Çita" },
{ q: "Bir köpek hangi yaşta yetişkindir?", a: "2 yaş" },
{ q: "Dünyadaki en tuhaf hayvan hangisidir?", a: "Ornitorenk" },
{ q: "Bir tavuk uçamaz mı?", a: "Çoğu tür uçamaz" },
{ q: "Hangi hayvan kendi rengini değiştirebilir?", a: "Bukalemun" },
{ q: "Dünyadaki en uzun solucan kaç metre olabilir?", a: "10 metre" },
{ q: "Bir arı neden bal yapar?", a: "Beslenmek için" },
{ q: "Hangi hayvan sırtında taş taşır?", a: "Kaplumbağa" },
{ q: "Dünyadaki en büyük böcek hangisidir?", a: "Dev böcek (Goliath böceği)" },
{ q: "Hangi hayvan uçamaz ama yumurtlar?", a: "Ornitorenk" },
{ q: "Kediler neden mırlanır?", a: "Rahatlamak için" },
{ q: "Bir örümcek kaç ayaklıdır?", a: "8" },
{ q: "Dünyadaki en uzun boyunlu hayvan hangisidir?", a: "Zürafa" },
{ q: "Hangi hayvan sessiz yürür?", a: "Kaplan" },
{ q: "Bir inek neden ot yer?", a: "Beslenmek için" },
{ q: "Dünyadaki en hızlı deniz canlısı hangisidir?", a: "Yelken balığı" },
{ q: "Hangi hayvan ters dönebilir?", a: "Yılan" },
{ q: "Bir karınca neden kolonide yaşar?", a: "Güvenlik ve işbirliği için" },
{ q: "Dünyadaki en büyük memeli hangisidir?", a: "Mavi balina" },
{ q: "Hangi hayvan uçabilir ama kuş değildir?", a: "Yarasa" },
{ q: "Bir fil kaç yıl yaşayabilir?", a: "60-70 yıl" },
{ q: "Hangi hayvan 1 hafta aç kalabilir?", a: "Ayı" },
{ q: "Dünyadaki en hızlı kuş hangisidir?", a: "Albatros" },
{ q: "Bir karınca kaç yumurta bırakabilir?", a: "500" },
{ q: "Hangi hayvan su altında uyuyabilir?", a: "Balina" },
{ q: "Dünyadaki en uzun çöl hangisidir?", a: "Sahara" },
{ q: "Hangi hayvan kafasını 360 derece çevirebilir?", a: "Baykuş" },
{ q: "Bir tavşan neden hızlı koşar?", a: "Kendi güvenliği için" },
{ q: "Dünyadaki en uzun nehir hangisidir?", a: "Nil" },
{ q: "Hangi hayvan kendi rengini değiştirir?", a: "Bukalemun" },
{ q: "Bir fil hortumunu ne için kullanır?", a: "Su içmek ve koklamak" },
{ q: "Dünyadaki en büyük kuş hangisidir?", a: "Deve kuşu" },
{ q: "Hangi hayvan ters dönebilir?", a: "Yılan" },
{ q: "Bir arı neden bal yapar?", a: "Beslenmek için" },
{ q: "Dünyadaki en küçük memeli hangisidir?", a: "Yarasa" },
{ q: "Hangi hayvanın 3 kalbi vardır?", a: "Ahtapot" },
{ q: "Bir köpek kaç yaşında insan yaşıyla 70 yaşında olur?", a: "10 yaş" },
{ q: "Dünyadaki en uzun kemik hangisidir?", a: "Uyluk kemiği" },
{ q: "Hangi hayvan sadece gece aktiftir?", a: "Baykuş" },
{ q: "Bir tavşan neden uzun kulaklara sahiptir?", a: "Dikkat ve yön bulmak için" },
{ q: "Dünyadaki en uzun süre yaşayan memeli hangisidir?", a: "Grönland balinası" },
{ q: "Hangi hayvan kendi zehrini üretir?", a: "Engerek yılanı" },
{ q: "Bir karınca kolonisi kaç karıncadan oluşur?", a: "Binlerce" },
{ q: "Dünyadaki en büyük böcek hangisidir?", a: "Goliath böceği" },
{ q: "Hangi hayvan ters dönebilir?", a: "Yılan" },
{ q: "Bir kuş neden öter?", a: "İletişim için" },
{ q: "Dünyadaki en küçük kuş hangisidir?", a: "Arı kuşu" },
{ q: "Hangi hayvan karada ve suda yaşayabilir?", a: "Kurbağa" },
{ q: "Bir fil kaç kilo ağırlık taşıyabilir?", a: "200 kg" },
{ q: "Mona Lisa tablosu hangi müzede sergileniyor?", a: "Louvre" },
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
let currentTimeout = null;
let answered = false;

function sendNextQuestion() {
  answered = false;

  // Rastgele soru seç, önceki sorudan farklı olsun
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
    sendNextQuestion();
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
    if (username === "LoverBoy") {
      if (users.some(u => u.username === "LoverBoy")) {
        socket.emit("joinError", "LoverBoy nicki zaten kullanılıyor!");
        return;
      }
      if (password !== "3530657Ynz") {
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
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    });
  });

  socket.on("chatMessage", (msg) => {
    if (bannedWords.some(word => msg.content.toLowerCase().includes(word))) {
      socket.emit("kicked", { reason: "Küfür kullandığınız için atıldınız." });
      socket.disconnect();
      return;
    }

    // Quiz cevabı kontrolü
    if (currentQuestion && !answered && msg.content.toLowerCase() === currentQuestion.a.toLowerCase()) {
      answered = true;

      io.emit("chatMessage", {
        username: BOT_NAME,
        role: "bot",
        content: `Tebrikler ${msg.username}! Doğru cevabı bildiniz 🎉`,
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      });

      clearTimeout(currentTimeout);
      setTimeout(sendNextQuestion, QUESTION_INTERVAL);
      return;
    }

    messages.push(msg);
    io.emit("chatMessage", msg);
  });

  socket.on("kickUser", (userId) => {
    const adminUser = users.find(u => u.id === socket.id && u.role === "admin");
    if (!adminUser) return;

    const target = users.find(u => u.id === userId);
    if (target) {
      io.to(userId).emit("kicked", { reason: "Admin tarafından atıldınız." });
      io.sockets.sockets.get(userId)?.disconnect();
    }
  });

  socket.on("disconnect", () => {
    const user = users.find(u => u.id === socket.id);
    if (user) {
      users = users.filter(u => u.id !== socket.id);
      io.emit("users", users);
      io.emit("chatMessage", {
        username: "Sistem",
        role: "admin",
        content: `${user.username} sohbetten ayrıldı 🚪`,
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      });
    }
    console.log("🔴 Ayrıldı:", socket.id);
  });
});

// =====================
// BOTU BAŞLAT
// =====================
sendNextQuestion();

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
