const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const messagesFile = 'messages.json';
if (!fs.existsSync(messagesFile)) fs.writeFileSync(messagesFile, '[]');

// Kullanıcı bağlandığında
io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı');

    // Mevcut mesajları gönder
    const messages = JSON.parse(fs.readFileSync(messagesFile));
    socket.emit('load_messages', messages);

    // Mesaj al
    socket.on('send_message', (msg) => {
        const messages = JSON.parse(fs.readFileSync(messagesFile));
        const message = { nick: msg.nick, text: msg.text, time: Date.now() };
        messages.push(message);
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

        // Tüm kullanıcılara ilet
        io.emit('new_message', message);
    });

    // Bot mesajları örnek
    const botMessages = [
        "Selam millet 🙋",
        "Buralar bugün sakin…",
        "Yeni gelenler hoş geldiniz! ☕",
        "Bilgi: İnsan beyni 86 milyar nörona sahiptir! 🤯"
    ];

    function botSendMessage() {
        const text = botMessages[Math.floor(Math.random() * botMessages.length)];
        const botMessage = { nick: "RüzGar", text, time: Date.now() };
        const messages = JSON.parse(fs.readFileSync(messagesFile));
        messages.push(botMessage);
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
        io.emit('new_message', botMessage);
    }

    setInterval(botSendMessage, Math.floor(Math.random()*20000)+20000);
});

server.listen(process.env.PORT || 3000, () => console.log('Node.js server çalışıyor'));
