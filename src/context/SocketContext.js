import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const { userData } = useAuth();
    const { userName } = userData?.data?.user || {};
    const [isVisible, setIsVisible] = useState(document.visibilityState === 'visible');
    const [hasFocus, setHasFocus] = useState(document.visibilityState === 'visible');

    useEffect(() => {
        const socketInstance = io('http://192.168.1.7:3001');
        socket.current = (socketInstance);

        socketInstance.on('connect', () => {
            socketInstance.emit('connectionUpdate', { userName, socketId: socketInstance.id })
        });

        return () => {
            socketInstance.close();
        }
    }, [userName]);

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
        if (!socket) return;
        const status = isVisible && hasFocus ? 'online' : 'offline';
        setTimeout(() => {
            socket.current.emit('updateUserStatus', { userName, status, hasFocus });
        }, 10);
    }, [isVisible, hasFocus, userName, socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
