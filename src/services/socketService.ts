import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL!;

class SocketService {
  public socket: Socket | null = null;
  private currentUserId: string | null = null;
  private listeners: { event: string; callback: (data: any) => void }[] = [];

  connect(userId: string) {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected, re-joining room for user:', userId);
      this.socket.emit('join_room', userId);
      return;
    }
    
    if (this.socket) {
      this.disconnect();
    }

    console.log('Initiating socket connection for:', userId);
    this.currentUserId = userId;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket Connected! ID:', this.socket?.id, 'User:', userId);
      this.socket?.emit('join_room', userId);
      
      // Re-attach all queued listeners
      this.listeners.forEach(({ event, callback }) => {
        this.socket?.on(event, callback);
      });
    });

    this.socket.on('reconnect', () => {
      console.log('Socket reconnected, re-joining room:', userId);
      this.socket?.emit('join_room', userId);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
      // We keep the listeners array so they can be re-attached on next connect
    }
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn(`Attempted to emit ${event} while socket is not connected.`);
    }
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    // Store in our local list to ensure it persists across reconnects/late connects
    const exists = this.listeners.find(l => l.event === event && l.callback === callback);
    if (!exists) {
      this.listeners.push({ event, callback });
    }
    
    // If socket is already there, attach it immediately
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.listeners = this.listeners.filter(l => !(l.event === event && l.callback === callback));
      this.socket?.off(event, callback);
    } else {
      this.listeners = this.listeners.filter(l => l.event !== event);
      this.socket?.off(event);
    }
  }
}

export const socketService = new SocketService();
