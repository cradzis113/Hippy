import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userData } = useAuth();
    const { userName } = userData.data.user;
    const { currentChatUser } = useData()

    useEffect(() => {
        const socketInstance = io('http://localhost:3000');
        setSocket(socketInstance);

        const handleVisibilityChange = () => {
            const status = document.hidden ? 'offline' : 'online';
            socketInstance.emit('updateUserStatus', { userName, status, requiresNotification: true })
        };

        socketInstance.on('connect', () => {
            socketInstance.emit('updateUserStatus', { userName, status: 'online', requiresNotification: false });
            document.addEventListener('visibilitychange', handleVisibilityChange);
        });

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userName, currentChatUser]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
