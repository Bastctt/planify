import { create } from 'zustand';
import { notificationsService } from '@/services/notificationsService';

interface NotificationsState {
  count: number;
  loading: boolean;
  fetchCount: () => Promise<void>;
  setCount: (count: number) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  count: 0,
  loading: false,

  fetchCount: async () => {
    const count = await notificationsService.getUnreadNotificationCount();
    set({ count });
  },
  
  setCount: (count: number) => set({ count }),
}));
