const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');  // Path modülünü import ettik

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// Static dosyaları sunmak için public klasörünü kullanıyoruz
app.use(express.static(path.join(__dirname, 'public')));

// Anasayfa endpointi (index.html dosyasını public klasöründen gönderiyoruz)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // public dizininden index.html dosyasını gönder
});

let messages = [];

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  // Geçmiş mesajları gönder
  socket.emit("initMessages", messages);

  // Yeni mesaj alındığında yayınla
  socket.on("chatMessage", (msg) => {
    messages.push(msg);
    io.emit("chatMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

// Render platformunda portu dinamik olarak ayarla (10000 kullanabiliriz)
const PORT = process.env.PORT || 10000;  // render için 10000, localde 3000 kullanıyoruz
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
