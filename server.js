const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// Socket bağlantısı
io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı");

  socket.on("publicMessage", (data) => {
    io.emit("publicMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı");
  });
});

// ROOT TEST (ÇOK ÖNEMLİ)
app.get("/", (req, res) => {
  res.send("Socket Server Çalışıyor");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
