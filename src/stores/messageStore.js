import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import useSettingStore from './settingStore';

const useMessageStore = create((set, get) => ({
    message: '',
    userReplied: '',
    messageReplied: '',
    setMessage: (message) => set((state) => ({ message: message instanceof Function ? message(state.message) : message })),
    setUserReplied: (userReplied) => set({ userReplied }),
    setMessageReplied: (messageReplied) => set({ messageReplied }),
    sendMessage: (userName, currentUser, socket) => {
        const { message, userReplied, messageReplied } = get();
        const setHasEmittedSeen = useSettingStore.getState().setHasEmittedSeen;
        const time = moment().format('YYYY-MM-DD HH:mm');

        const newMessage = {
            id: uuidv4(),
            time: time,
            message: message,
            recipientUserName: userName,
            senderUserName: currentUser,
            replyInfo: (messageReplied && userReplied) ? { messageReplied, userReplied } : undefined
        };

        socket.emit('privateChat', newMessage);
        socket.emit('sendMessage', newMessage);
        setHasEmittedSeen(false);

        set({ message: '', userReplied: '', messageReplied: '' });
    }
}));

export default useMessageStore;
