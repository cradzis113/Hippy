import React, { useEffect, useState } from 'react';
import { Avatar, Badge, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const Conversation = () => {
    const socket = useSocket();
    const { userData } = useAuth();
    const { setCurrentChatUser, messageBackState } = useData();

    const initialMessageHistory = userData?.data?.user?.messageHistory || {};
    const currentUserName = userData?.data?.user?.userName || '';

    const [chatMessageHistory, setChatMessageHistory] = useState(initialMessageHistory);
    const [newMessage, setNewMessage] = useState('');

    const formatTime = (timestamp) => {
        if (!timestamp) {
            return '';
        }

        const [datePart, timePart] = timestamp.split(' ');

        if (!timePart) {
            return '';
        }

        const [hours, minutes] = timePart.split(':');
        return `${hours}:${minutes}`;
    };

    const handleClick = (userName) => {
        if (socket) {
            socket.current.emit('search', userName, (error, results) => {
                if (error) {
                    console.error('Search error:', error);
                } else {
                    setCurrentChatUser(results[0]);
                    socket.current.emit('chatEvent', {
                        recipientUserName: results[0].userName,
                        recipientSocketId: results[0].socketId,
                        userName: currentUserName,
                        socketId: socket.current.id,
                        type: 'chatRequest'
                    });
                }
            });
        }
    };

    const processUserMessages = (chatMessageHistory, userName, currentUserName) => {
        const userMessages = chatMessageHistory[userName];
        let lastMessage = userMessages[userMessages.length - 1];
        let unseenMessageCount = 0;

        const firstNonRevokedByOtherUser = userMessages.find(
            message => !message?.revoked?.revokedBoth && !message.revoked?.revokedBy?.includes(userName)
        );

        const firstNonRevokedMessageIndex = userMessages.findIndex(message => !message.revoked);
        const messagesRevokedByCurrentUser = userMessages.filter(
            message => message?.revoked?.revokedBy?.includes(currentUserName)
        );

        const nonRevokedMessages = userMessages
            .filter(msg => !msg?.revoked?.revokedBoth && !msg?.revoked?.revokedBy?.includes(currentUserName))
            .reverse();

        const latestRevokedMessage = nonRevokedMessages.reverse().find(message => message.revoked);
        const revokedMessagesByBoth = userMessages.filter(
            msg => msg?.revoked?.revokedBoth && !msg?.revoked?.revokedBy?.includes(currentUserName)
        );

        const firstMessageRevokedByBoth = revokedMessagesByBoth.find(msg => msg?.revoked?.revokedBoth);
        const latestMessageRevokedByBoth = revokedMessagesByBoth.reverse().find(msg => msg?.revoked?.revokedBoth);
        const latestRevokedIndex = userMessages.findIndex(msg => msg?.id === latestMessageRevokedByBoth?.id);
        const latestNonRevokedIndex = userMessages.findIndex(
            msg => msg?.id === nonRevokedMessages[nonRevokedMessages.length - 1]?.id
        );
        const n = userMessages.findIndex(i => i.seen)

        if (firstNonRevokedByOtherUser) {
            if (latestNonRevokedIndex > latestRevokedIndex) {
                lastMessage = userMessages[latestNonRevokedIndex];
            } else if (latestRevokedIndex !== -1 && !userMessages[latestRevokedIndex]?.revoked?.revokedBy?.includes(currentUserName)) {
                lastMessage = {
                    message: `${userMessages[latestRevokedIndex].senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            } else if (messagesRevokedByCurrentUser.length === userMessages.length) {
                lastMessage = { message: 'History was cleared' };
            } else if (messagesRevokedByCurrentUser.length + 1 === userMessages.length && firstNonRevokedMessageIndex !== -1) {
                lastMessage = userMessages[firstNonRevokedMessageIndex];
            } else if (
                userMessages[0].revoked &&
                lastMessage.revoked &&
                !lastMessage.revoked.revokedBoth &&
                !userMessages[0].revoked.revokedBoth &&
                latestRevokedMessage
            ) {
                lastMessage = latestRevokedMessage;
            } else if (nonRevokedMessages.length > 1) {
                lastMessage = nonRevokedMessages[nonRevokedMessages.length - 1];
            } else if (revokedMessagesByBoth.length > 0 && nonRevokedMessages.length === 0) {
                lastMessage = {
                    message: `${revokedMessagesByBoth.reverse()[0].senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            }
        } else {
            if (
                userMessages[0]?.revoked?.revokedBy?.includes(currentUserName) &&
                lastMessage?.revoked?.revokedBy?.includes(currentUserName) &&
                userMessages.length === 2
            ) {
                lastMessage = { message: 'History was cleared' };
            } else if (lastMessage?.revoked?.revokedBoth && !lastMessage?.revoked?.revokedBy?.includes(currentUserName)) {
                lastMessage = {
                    message: `${lastMessage.senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            } else if (messagesRevokedByCurrentUser.length === userMessages.length) {
                lastMessage = { message: 'History was cleared' };
            } else if (firstMessageRevokedByBoth && lastMessage.revoked.revokedBoth) {
                lastMessage = {
                    message: `${firstMessageRevokedByBoth.senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            } else if (nonRevokedMessages.length === 1 && !firstMessageRevokedByBoth) {
                lastMessage = nonRevokedMessages[0];
            } else if (nonRevokedMessages.length > 1) {
                lastMessage = nonRevokedMessages[nonRevokedMessages.length - 1];
            } else if (firstMessageRevokedByBoth && nonRevokedMessages.length === 0) {
                lastMessage = {
                    message: `${firstMessageRevokedByBoth.senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            }
        }

        if (n !== -1) {
            unseenMessageCount = userMessages.slice(n + 1).length;
        } else if (n === 1) {
            unseenMessageCount = userMessages.slice(n).length;
        } else if(n === -1) {
            
        }

        return { lastMessage, unseenMessageCount };
    };

    useEffect(() => {
        if (!socket.current || !userData?.data?.user) return;

        const notificationData = (data) => {
            setNewMessage(data);
        };

        const messageHistory = (data) => {
            setChatMessageHistory(data);
        };

        const readMessages = (data) => {
            setChatMessageHistory(data.messageHistory);
        };

        socket.current.on('connect', () => {
            socket.current.emit('chatEvent', { socketId: socket.current.id, userName: userData.data.user.userName, type: 'register' });
        });

        socket.current.on('notification', notificationData);
        socket.current.on('messageHistoryUpdate', messageHistory);
        socket.current.on('readMessages', readMessages);

        return () => {
            socket.current.off('notification', notificationData);
            socket.current.off('messageHistoryUpdate', messageHistory);
            socket.current.off('readMessages', readMessages);
        };
    }, [socket.current]);

    useEffect(() => {
        if (Object.keys(messageBackState).length > 0) {
            setChatMessageHistory(messageBackState);
        }
    }, [messageBackState]);

    return (
        <Box
            sx={{
                maxWidth: '100%',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                    borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: grey[400],
                    borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#555',
                },
            }}
        >
            <List>
                {chatMessageHistory && Object.keys(chatMessageHistory).map((userName, index) => {
                    const { lastMessage, unseenMessageCount } = processUserMessages(chatMessageHistory, userName, currentUserName);

                    return (
                        <ListItem
                            key={index}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                transition: 'background-color 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0',
                                    cursor: 'pointer',
                                },
                            }}
                            onClick={() => handleClick(userName)}
                        >
                            <ListItemAvatar>
                                <Avatar alt={userName} src={lastMessage?.url} sx={{ width: 54, height: 54, mr: 2 }} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography
                                            variant="body1"
                                            component="span"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {userName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {lastMessage?.senderUserName === currentUserName && (lastMessage?.seen ? (
                                                <DoneAllIcon sx={{ fontSize: 14, mb: 0.3 }} />
                                            ) : (
                                                <DoneIcon sx={{ fontSize: 14, mb: 0.3 }} />
                                            ))}

                                            <Typography
                                                variant="caption"
                                                component="span"
                                                sx={{ color: 'text.secondary', ml: 0.5 }}
                                            >
                                                {formatTime(lastMessage?.time)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                                secondary={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        component={'span'}>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            component={'span'}
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {newMessage.senderUserName === userName || newMessage.recipientUserName === userName ? String(newMessage.message) : String(lastMessage.message)}
                                        </Typography>
                                        {lastMessage?.senderUserName !== currentUserName && <Badge badgeContent={unseenMessageCount} color='primary' sx={{ mr: 1 }} />}
                                    </Box>
                                }
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Box >
    );
};

export default Conversation;
