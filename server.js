const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// Static dosyaları sunmak için
app.use(express.static(path.join(__dirname, 'public'))); // public klasöründeki dosyaları sunuyoruz

// Anasayfa endpointi
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // index.html dosyasını gönderiyor
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

// Render platformunda portu dinamik olarak ayarla
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
