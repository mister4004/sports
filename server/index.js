const fs = require('fs');
const https = require('https');
const { Server } = require('socket.io');

// Настройка HTTPS-сервера
const httpsServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/ping-speed.ddns.net/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/ping-speed.ddns.net/fullchain.pem'),
});

const io = new Server(httpsServer, {
    cors: {
        origin: '*',
    },
});

const rooms = {};

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Создание комнаты
    socket.on('createRoom', ({ roomId, password }) => {
        rooms[roomId] = { password, adminSocketId: socket.id };
        console.log(`Room created: ${roomId}`);
        socket.emit('roomCreated', { roomId });
    });

    // Присоединение клиента к комнате
    socket.on('joinRoom', ({ roomId, password }) => {
        const room = rooms[roomId];
        if (!room || room.password !== password) {
            socket.emit('joinError', 'Invalid room or password');
            return;
        }
        room.clientSocketId = socket.id;
        socket.join(roomId);
        io.to(room.adminSocketId).emit('clientJoined', { clientId: socket.id });
        console.log(`Client joined room: ${roomId}`);
    });

    // Проброс сигналов WebRTC
    socket.on('webrtcSignal', ({ roomId, signal, to }) => {
        io.to(to).emit('webrtcSignal', { signal, from: socket.id });
    });

    // Отключение
    socket.on('disconnect', () => {
        Object.keys(rooms).forEach((roomId) => {
            const room = rooms[roomId];
            if (room.adminSocketId === socket.id || room.clientSocketId === socket.id) {
                delete rooms[roomId];
                console.log(`Room ${roomId} closed`);
            }
        });
    });
});

httpsServer.listen(3001, () => {
    console.log('WebSocket server running on https://ping-speed.ddns.net:3001');
});
