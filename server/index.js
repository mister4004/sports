const fs = require('fs');
const https = require('https');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const activeClients = {};

const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/ping-speed.ddns.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/ping-speed.ddns.net/fullchain.pem'),
}, app);

const io = new Server(httpsServer, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  path: '/socket.io/',
});

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('registerAdmin', ({ password }) => {
    if (password === 'ejik2242') {
      console.log('Admin authenticated');
      socket.emit('adminRegistered');
      // Отправляем список клиентов при входе
      socket.emit('updateClientList', Object.keys(activeClients));
    } else {
      console.log('Admin authentication failed');
      socket.disconnect(true);
    }
  });

  socket.on('readyForOffer', () => {
    console.log(`Client ${socket.id} is ready for offer`);
    activeClients[socket.id] = true;
    io.emit('updateClientList', Object.keys(activeClients));
  });

  socket.on('webrtcSignal', ({ signal, targetId }) => {
    const targetSocket = io.sockets.sockets.get(targetId);
    if (targetSocket) {
      targetSocket.emit('webrtcSignal', { signal, from: socket.id });
    } else {
      console.log(`Target client ${targetId} not found`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    delete activeClients[socket.id];
    io.emit('updateClientList', Object.keys(activeClients));
  });
});

httpsServer.listen(3001, () => {
  console.log('HTTPS Server is running on https://ping-speed.ddns.net');
});
