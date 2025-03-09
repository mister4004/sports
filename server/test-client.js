const io = require('socket.io-client');

// Подключение к серверу
const socket = io("https://ping-speed.ddns.net:3001");

// Логирование подключений
socket.on('connect', () => {
    console.log(`Connected to server with ID: ${socket.id}`);
    
    // Создание комнаты
    socket.emit('createRoom', { roomId: "testRoom", password: "123" });

    // Присоединение клиента
    setTimeout(() => {
        socket.emit('joinRoom', { roomId: "testRoom", password: "123" });
    }, 1000);
});

// Логирование событий
socket.on('roomCreated', (data) => {
    console.log("Room created event:", data);
});

socket.on('joinError', (error) => {
    console.error("Join error:", error);
});

socket.on('clientJoined', (data) => {
    console.log("Client joined event:", data);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
