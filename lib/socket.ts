import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';
type ConnectionStateCallback = (state: ConnectionState) => void;

class SocketService {
  private socket: TypedSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private stateCallbacks: Set<ConnectionStateCallback> = new Set();
  private _state: ConnectionState = 'disconnected';

  get state(): ConnectionState {
    return this._state;
  }

  get isConnected(): boolean {
    return this._state === 'connected';
  }

  private setState(state: ConnectionState) {
    this._state = state;
    this.stateCallbacks.forEach((cb) => cb(state));
  }

  onStateChange(callback: ConnectionStateCallback): () => void {
    this.stateCallbacks.add(callback);
    return () => {
      this.stateCallbacks.delete(callback);
    };
  }

  connect(url: string) {
    if (this.socket?.connected) return;

    this.setState('connecting');

    this.socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    }) as TypedSocket;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      this.reconnectAttempts = 0;
      this.setState('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      this.setState('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error('[Socket] Connection error:', error.message);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
        this.setState('failed');
      }
    });
  }

  emit<E extends keyof ClientToServerEvents>(
    event: E,
    ...args: Parameters<ClientToServerEvents[E]>
  ) {
    if (!this.socket) {
      console.warn('[Socket] Cannot emit, not connected');
      return;
    }
    this.socket.emit(event, ...args);
  }

  on<E extends keyof ServerToClientEvents>(
    event: E,
    handler: ServerToClientEvents[E]
  ) {
    this.socket?.on(event, handler as never);
  }

  off<E extends keyof ServerToClientEvents>(
    event: E,
    handler?: ServerToClientEvents[E]
  ) {
    if (handler) {
      this.socket?.off(event, handler as never);
    } else {
      this.socket?.off(event);
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.reconnectAttempts = 0;
    this.setState('disconnected');
  }

  getSocket(): TypedSocket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
