import { useState } from "react";
import useAuthStore from "../stores/authStore";
import useSocketStore from "../stores/socketStore";

export default setupWindowEventHandlers = () => {
    const { userName } = useAuthStore(state => state.userData);
    const { socket } = useSocketStore(state => state.socket);
    const [isVisible, setIsVisible] = useState(document.visibilityState === 'visible');
    const [hasFocus, setHasFocus] = useState(document.visibilityState === 'visible');
    
    const handleVisibilityChange = () => {
        const isVisible = document.visibilityState === 'visible';
        setIsVisible(isVisible);
    };

    const handleFocus = () => {
        setHasFocus(true);
    };

    const handleBlur = () => {
        setHasFocus(false);
    };

    useEffect(() => {
        if (!socket) return;
        const status = isVisible && hasFocus ? 'online' : 'offline';
        setTimeout(() => {
            socket.current.emit('updateUserStatus', { userName, status, hasFocus });
        }, 10);
    }, [isVisible, hasFocus, userName, socket]);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
    };
}; 