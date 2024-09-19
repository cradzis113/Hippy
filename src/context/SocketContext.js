import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userData } = useAuth();
    const { userName } = userData?.data?.user || {};
    const [isVisible, setIsVisible] = useState(document.visibilityState === 'visible');
    const [hasFocus, setHasFocus] = useState(false);

    useEffect(() => {
        const socketInstance = io('http://localhost:3000');
        setSocket(socketInstance);
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(document.visibilityState === 'visible');
        };

        const handleFocus = () => {
            setHasFocus(true);
        };

        const handleBlur = () => {
            setHasFocus(false);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    useEffect(() => {
        if (socket && userName) {
            const status = isVisible && hasFocus ? 'online' : 'offline';
            socket.emit('updateUserStatus', { userName, status, hasFocus });
        }
    }, [isVisible, hasFocus, userName, socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
