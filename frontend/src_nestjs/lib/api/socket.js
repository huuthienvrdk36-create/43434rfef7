// WebSocket client for realtime notifications
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

class SocketService {
  socket = null;
  listeners = new Map();

  connect(userId) {
    if (this.socket?.connected) return;

    this.socket = io(`${BACKEND_URL}/notifications`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    this.socket.on('notification', (data) => {
      console.log('[Socket] Notification received:', data);
      this.listeners.forEach((callback) => callback(data));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(userId) {
    if (this.socket?.connected) {
      this.socket.emit('join', userId);
    }
  }

  leaveRoom(userId) {
    if (this.socket?.connected) {
      this.socket.emit('leave', userId);
    }
  }

  onNotification(id, callback) {
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
