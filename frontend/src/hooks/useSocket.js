// src/hooks/useSocket.js
import { useEffect } from 'react';
import { socket } from '../lib/socket';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore'; // <-- Import the dedicated store

// This hook's only job is to manage the socket connection
export const useSocket = () => {
    const { user, token } = useAuthStore();
    
    useEffect(() => {
        if (!token || !user?.id) {
            if (socket.connected) {
                socket.disconnect();
            }
            return;
        }

        if (!socket.connected) {
            socket.connect();
        }

        const onConnect = () => {
            console.log('Socket connected! Joining room:', user.id);
            socket.emit('join_room', user.id);
        };
        
        const onNewNotification = (notification) => {
            console.log('Frontend received new_notification:', notification);
            // Add notification to our global store
            useNotificationStore.getState().addNotification(notification);
        };

        socket.on('connect', onConnect);
        socket.on('new_notification', onNewNotification);

        // Cleanup function
        return () => {
            socket.off('connect', onConnect);
            socket.off('new_notification', onNewNotification);
        };
    }, [token, user?.id]);
};