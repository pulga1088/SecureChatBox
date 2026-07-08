import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from './apiService';

let socket: Socket | null = null;

/**
 * Initialize and connect to backend Socket.IO server.
 * Passes the backend JWT token inside the handshake auth payload.
 */
export const connectSocket = (token: string): Socket => {
  if (socket) {
    socket.auth = { token };
    if (socket.connected) return socket;
    socket.connect();
    return socket;
  }

  socket = io(BACKEND_URL, {
    auth: { token },
    transports: ['polling', 'websocket'],
    autoConnect: true,
    extraHeaders: {
      'Bypass-Tunnel-Reminder': 'true',
      'ngrok-skip-browser-warning': 'true'
    }
  });

  socket.on('connect', () => {
    console.log('Socket.IO Connected successfully to backend');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.IO Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO Connection Error:', error);
  });

  return socket;
};

/**
 * Retrieve the active socket instance.
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect socket connection.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
