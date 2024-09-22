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
        let newMessage;

        newMessage = {
            time: time,
            message: message,
            recipientUserName: userName,
            senderUserName: userData?.userName || userData?.data?.user?.userName
        };

        setMessage('');
        socket.current.emit('sendMessage', newMessage);

    };

    return { message, setMessage, sendMessage };
};

export default useSendMessage;
