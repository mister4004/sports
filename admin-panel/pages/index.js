import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SERVER_IP = 'wss://ping-speed.ddns.net:3001';
let socket;

export default function AdminPanel() {
    const [roomId, setRoomId] = useState('');
    const [password, setPassword] = useState('');
    const [clients, setClients] = useState([]);
    const [log, setLog] = useState([]);

    useEffect(() => {
        socket = io(SERVER_IP, { transports: ['websocket'], secure: true });

        socket.on('connect', () => {
            addLog('Connected to the server.');
        });

        socket.on('clientJoined', ({ clientId }) => {
            setClients((prev) => [...prev, clientId]);
            addLog(`Client joined: ${clientId}`);
        });

        socket.on('roomCreated', ({ roomId }) => {
            addLog(`Room ${roomId} created successfully.`);
        });

        socket.on('connect_error', (err) => {
            addLog(`Connection error: ${err.message}`);
        });

        socket.on('error', (err) => {
            addLog(`Error: ${err}`);
        });

        return () => {
            if (socket) {
                socket.disconnect();
                addLog('Disconnected from the server.');
            }
        };
    }, []);

    const createRoom = () => {
        if (!roomId || !password) {
            addLog('Room ID and password are required.');
            return;
        }
        socket.emit('createRoom', { roomId, password });
    };

    const sendCommand = (clientId) => {
        if (!roomId) {
            addLog('Room ID is required to send commands.');
            return;
        }

        const command = {
            roomId,
            action: 'click', // Example action: 'click' or 'input'
            selector: '#username', // Example selector
            value: 'admin' // Example value for input
        };

        socket.emit('performAction', { clientId, command });
        addLog(`Command sent to ${clientId}: ${JSON.stringify(command)}`);
    };

    const addLog = (message) => {
        setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Admin Panel</h1>
            <div>
                <label>Room ID: </label>
                <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter room ID"
                />
            </div>
            <div>
                <label>Password: </label>
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Enter password"
                />
            </div>
            <button onClick={createRoom}>Create Room</button>

            <h2>Clients:</h2>
            <ul>
                {clients.map((client) => (
                    <li key={client}>
                        {client}
                        <button onClick={() => sendCommand(client)}>Connect</button>
                    </li>
                ))}
            </ul>

            <h2>Logs:</h2>
            <ul style={{ maxHeight: '200px', overflowY: 'scroll', background: '#f4f4f4', padding: '10px' }}>
                {log.map((entry, index) => (
                    <li key={index}>{entry}</li>
                ))}
            </ul>
        </div>
    );
}
