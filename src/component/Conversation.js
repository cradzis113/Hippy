import React, { useEffect, useState } from 'react';
import { Avatar, Badge, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const Conversation = () => {
    const socket = useSocket()
    const { userData } = useAuth()
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
                    socket.current.emit('chatEvent',
                        { recipientUserName: results[0].userName, recipientSocketId: results[0].socketId, userName: currentUserName, socketId: socket.current.id, type: 'chatRequest' }
                    );
                }
            })
        }
    }

    useEffect(() => {
        if (!socket.current || !userData?.data?.user) return;

        const notificationData = (data) => {
            setNewMessage(data)
        }

        const messageHistory = (data) => {
            setChatMessageHistory(data)
        }

        const readMessages = (data) => {
            setChatMessageHistory(data.messageHistory)
        }

        socket.current.on('connect', () => {
            socket.current.emit('chatEvent', { socketId: socket.current.id, userName: userData.data.user.userName, type: 'register' })
        })

        socket.current.on('notification', notificationData);
        socket.current.on('messageHistoryUpdate', messageHistory);
        socket.current.on('readMessages', readMessages);

        return () => {
            socket.current.off('notification', notificationData);
            socket.current.off('messageHistoryUpdate', messageHistory);
            socket.current.off('readMessages', readMessages);
        };
    }, [socket.current])

    useEffect(() => {
        if (Object.keys(messageBackState).length > 0) {
            setChatMessageHistory(messageBackState)
        }
    }, [messageBackState])

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
                    const userMessages = chatMessageHistory[userName];
                    const firstSeenMessageIndex = userMessages.findIndex(msg => msg.seen === true);
                    let lastMessage = userMessages[userMessages.length - 1];
                    let unSeenMessageCount = 0;

                    const revokedMessage = userMessages.find((message) => {
                        return message.revoked && !message.revoked.revokedBy.includes(userName);
                    });
                    const p = userMessages.filter(u => u.revoked && u.revoked.revokedBy.includes(currentUserName))
                    if (revokedMessage) {

                        const revokedIndex = userMessages.findIndex(message => message.id === revokedMessage.id);
                        if (revokedIndex === userMessages.length - 1) {
                            const previousMessage = userMessages[revokedIndex - 1];
                            lastMessage = previousMessage;
                        } else if (revokedIndex < userMessages.length - 1 && p.length > 1) {
                            const previousMessage = userMessages[revokedIndex - 1];
                            lastMessage = previousMessage;
                        } else if (revokedIndex < userMessages.length - 1 && p.length < 1) {
                            const previousMessage = userMessages[userMessages.length - 1];
                            lastMessage = previousMessage;
                        }
                    }

                    if (userMessages.length === 1) {
                        unSeenMessageCount = userMessages.slice(firstSeenMessageIndex).length;
                    }

                    if (firstSeenMessageIndex !== -1) {
                        unSeenMessageCount = userMessages.slice(firstSeenMessageIndex + 1).length;
                    }

                    if (firstSeenMessageIndex === -1) {
                        unSeenMessageCount = userMessages.length
                    }

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
                                        {lastMessage?.senderUserName !== currentUserName && <Badge badgeContent={unSeenMessageCount} color='primary' sx={{ mr: 1 }} />}
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
