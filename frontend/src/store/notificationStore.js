// src/store/notificationStore.js
import { create } from 'zustand';

const useNotificationStore = create((set) => ({
    notifications: [],
    setNotifications: (notifications) => set({ notifications }),
    addNotification: (notification) => set((state) => ({ 
        notifications: [notification, ...state.notifications] 
    })),
    clearNotifications: () => set({ notifications: [] }),
}));

export default useNotificationStore;