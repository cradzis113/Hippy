import { useState } from 'react';

const useSendMessage = () => {
    const [message, setMessage] = useState('');
    const now = new Date();

    const weekday = now.toLocaleDateString([], { weekday: 'long' });
    const day = now.toLocaleDateString([], { day: '2-digit' });
    const month = now.toLocaleDateString([], { month: 'long' });
    const year = now.toLocaleDateString([], { year: 'numeric' });
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateArray = [weekday, month, day, year, time]

    const sendMessage = (messages, setMessages, isYou) => {
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                name: isYou,
                message: message,
                time: dateArray,
            };
            setMessages([...messages, newMessage]); 
            setMessage(''); 
        }
    };

    return { message, setMessage, sendMessage };
};

export default useSendMessage;
