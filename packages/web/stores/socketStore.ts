import { create } from 'zustand';
import { socketService } from '@/lib/socket';
import { setupSocketListeners, teardownSocketListeners } from '@/lib/socketListeners';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface SocketStore {
  connectionState: ConnectionState;

  connect: (url?: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  connectionState: 'disconnected',

  connect: (url?: string) => {
    const socketUrl = url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    socketService.onStateChange((state) => {
      set({ connectionState: state });
    });

    socketService.connect(socketUrl);
    setupSocketListeners();
  },

  disconnect: () => {
    teardownSocketListeners();
    socketService.disconnect();
    set({ connectionState: 'disconnected' });
  },
}));
