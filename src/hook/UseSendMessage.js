import moment from 'moment';
import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const useSendMessage = () => {
    const [message, setMessage] = useState('');
    const [userReplied, setUserReplied] = useState('')
    const [messageReplied, setMessageReplied] = useState('')

    const socket = useSocket()
    const { userData } = useAuth()

    const time = moment().format('YYYY-MM-DD HH:mm');

    const sendMessage = (userName, messageReplied, userReplied) => {
        let newMessage;

        newMessage = {
            id: uuidv4(), 
            time: time,
            message: message,
            recipientUserName: userName,
            senderUserName: userData?.data?.user?.userName,
            replyInfo: (messageReplied && userReplied) ? { messageReplied, userReplied } : undefined
        };

        setMessage('');
        setUserReplied('')
        setMessageReplied('')

        socket.current.emit('privateChat', newMessage );
        socket.current.emit('sendMessage', newMessage)
    };

    return { message, setMessage, sendMessage, userReplied, setUserReplied, messageReplied, setMessageReplied };
};

export default useSendMessage;
