import moment from 'moment';
import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const useSendMessage = () => {
    const [message, setMessage] = useState('');
    const time = moment().format('YYYY-MM-DD HH:mm');
    const socket = useSocket()
    const { userData } = useAuth()

    const sendMessage = (userName) => {

        if (message.trim()) {
            const newMessage = {
                recipientUserName: userName,
                message: message,
                time: time,
                senderUserName: userData.data.user.userName
            };

            setMessage('');
            socket.emit('sendMessage', newMessage)
        }
    };

    return { message, setMessage, sendMessage };
};

export default useSendMessage;
