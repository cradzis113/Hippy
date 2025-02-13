import { useEffect } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../stores/authStore";
import useSocketStore from "../stores/socketStore";

export default function socketService() {
    const userName = useAuthStore(state => state.userName);
    const setSocket = useSocketStore(state => state.setSocket);
    const API_BASE = window.location.protocol === "https:"
        ? import.meta.env.VITE_API_URL_TUNNEL
        : `http://${window.location.hostname}:3001`;

    useEffect(() => {
        const socketInstance = io(API_BASE);
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            socketInstance.emit('connectionUpdate', { userName, socketId: socketInstance.id })
        });

        return () => {
            socketInstance.close();
        }
    }, [userName, API_BASE]);
}