import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SERVER_IP = 'wss://ping-speed.ddns.net:3001';
let socket;

function App() {
    const [roomId, setRoomId] = useState('');
    const [password, setPassword] = useState('');
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket = io(SERVER_IP, { transports: ['websocket'] });

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('joinError', (message) => {
            alert(`Error: ${message}`);
        });

        socket.on('webrtcSignal', ({ signal, from }) => {
            console.log('Received WebRTC signal:', signal, 'from:', from);
            // Здесь можно обработать сигнал для WebRTC
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const joinRoom = () => {
        socket.emit('joinRoom', { roomId, password });
        setConnected(true);
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Client Panel</h1>
            {!connected ? (
                <>
                    <div>
                        <label>Room ID: </label>
                        <input value={roomId} onChange={(e) => setRoomId(e.target.value)} />
                    </div>
                    <div>
                        <label>Password: </label>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                    </div>
                    <button onClick={joinRoom}>Join Room</button>
                </>
            ) : (
                <h2>Connected to room {roomId}!</h2>
            )}
        </div>
    );
}

export default App;
