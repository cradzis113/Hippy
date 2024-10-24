import React, { useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';

import { useAuth } from '../../context/AuthContext';
import useSendMessage from '../../hook/UseSendMessage';
import { useSocket } from '../../context/SocketContext';

import moment from 'moment';
import { Box, Chip, ListItem, ListItemText, List, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MessageList = ({ user }) => {
    const socket = useSocket();
    const { userData } = useAuth();

    const { message, setMessage, sendMessage, userReplied, setUserReplied, messageReplied, setMessageReplied } = useSendMessage();

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messages, setMessages] = useState([]);
    const currentUser = userData?.data?.user?.userName;

    useEffect(() => {
        const messageHistory = user?.messageHistory;
        if (!messageHistory || !messageHistory[currentUser]) {
            return setMessages([]);
        }

        const groupedMessages = {};
        messageHistory[currentUser].forEach((msg) => {
            const dateKey = moment(msg.time).format('YYYY-MM-DD');

            if (!groupedMessages[dateKey]) {
                groupedMessages[dateKey] = {
                    earliestTime: msg.time,
                    messages: [],
                };
            }
            if (msg.time < groupedMessages[dateKey].earliestTime) {
                groupedMessages[dateKey].earliestTime = msg.time;
            }
            groupedMessages[dateKey].messages.push(msg);
        });

        const formattedMessages = Object.keys(groupedMessages).map(date => ({
            time: groupedMessages[date].earliestTime,
            messages: groupedMessages[date].messages,
        }));

        setMessages(formattedMessages);
    }, [user, currentUser]);

    useEffect(() => {
        if (!socket) return;

        const handleMessageSent = (data) => {
            if (!data) {
                return setMessages([]);
            }

            const groupedMessages = {};
            data.forEach((msg) => {
                const dateKey = moment(msg.time).format('YYYY-MM-DD');

                if (!groupedMessages[dateKey]) {
                    groupedMessages[dateKey] = {
                        earliestTime: msg.time,
                        messages: [],
                    };
                }

                if (msg.time < groupedMessages[dateKey].earliestTime) {
                    groupedMessages[dateKey].earliestTime = msg.time;
                }

                groupedMessages[dateKey].messages.push(msg);
            });

            const formattedMessages = Object.keys(groupedMessages).map(date => ({
                time: groupedMessages[date].earliestTime,
                messages: groupedMessages[date].messages,
            }));

            setMessages(formattedMessages);
        };

        socket.current.on('messageSent', handleMessageSent);
        return () => {
            socket.current.off('messageSent', handleMessageSent);
        };
    }, [socket]);

    const handleSendMessage = () => {
        if (message.trim()) sendMessage(user.userName, messageReplied, userReplied);
    };

    const handleCloseReliedMessage = () => {
        setMessageReplied(null);
        setUserReplied(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '92vh', overflow: 'hidden' }}>
            <Box
                sx={{
                    mt: 2,
                    flexGrow: 1,
                    overflowY: 'auto',
                    position: 'relative',
                    '&::-webkit-scrollbar': { width: '5px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
                    '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
                }}
            >
                {messages.map((dayGroup, index) => (
                    <React.Fragment key={index}>
                        <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', position: 'sticky', top: 0 }}>
                            <Chip label={moment(dayGroup.time).format('MMMM D')} />
                        </Box>
                        {dayGroup.messages.map((item, msgIndex) => (
                            <React.Fragment key={msgIndex}>
                                {!item?.revoked?.revokedBy?.includes(currentUser) && (
                                    <Box
                                        sx={{
                                            width: 650,
                                            padding: 1,
                                            display: 'flex',
                                            margin: '0 auto',
                                            flexDirection: item.senderUserName === currentUser ? 'row-reverse' : 'row',
                                        }}
                                    >
                                        <MessageItem
                                            item={item}
                                            currentUser={currentUser}
                                            setUserReplied={setUserReplied}
                                            setMessageReplied={setMessageReplied}
                                        />
                                    </Box>
                                )}
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                ))}
            </Box>
            <Box
                sx={{
                    width: 650,
                    margin: '0 auto',
                    position: 'relative',
                }}
            >
                {(messageReplied && userReplied) && (
                    <List sx={{ pb: 0 }}>
                        <ListItem
                            disablePadding
                            sx={{
                                backgroundColor: 'lightgray',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                padding: '0 8px',
                            }}
                            secondaryAction={
                                <IconButton aria-label="comment" onClick={handleCloseReliedMessage}>
                                    <CloseIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={`${userReplied} replied:`}
                                secondary={messageReplied}
                            />
                        </ListItem>
                    </List>
                )}
                <MessageInput
                    message={message}
                    setMessage={setMessage}
                    handleSendMessage={handleSendMessage}
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                />
            </Box>
        </Box>
    );
};

export default MessageList;
