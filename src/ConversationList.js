import React, { useEffect, useState } from 'react';
import { Badge, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSocket } from '../../context/SocketContext';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BadgeAvatars from './BadgeAvatars';

const ConversationList = () => {
    const socket = useSocket();
    const { userData } = useAuth();
    const { setCurrentChatUser, messageBackState, setCarouselSlides, carouselSlides } = useData();

    const initialMessageHistory = userData?.data?.user?.messageHistory || {};
    const currentUserName = userData?.data?.user?.userName || '';

    const [newMessage, setNewMessage] = useState('');
    const [chatMessageHistory, setChatMessageHistory] = useState(initialMessageHistory);

    const [userTarget, setUserTarget] = useState('')
    const pinnedInfo = userData?.data?.user?.pinnedInfo || {};
    const pinnedMessages = pinnedInfo[userTarget] || [];

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
                    setUserTarget(results[0].userName)
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

        const messagesRevokedByCurrentUser = userMessages.filter(
            message => message?.revoked?.revokedBy?.includes(currentUserName)
        );

        const nonRevokedMessages = userMessages.filter(
            msg => !msg?.revoked?.revokedBoth && !msg?.revoked?.revokedBy?.includes(currentUserName)
        );

        const revokedMessagesByBoth = userMessages.filter(
            msg => msg?.revoked?.revokedBoth && !msg?.revoked?.revokedBy?.includes(currentUserName)
        );

        const firstSeenMessageIndex = userMessages.findIndex(i => i.seen)
        const firstMessageRevokedByBoth = revokedMessagesByBoth.find(msg => msg?.revoked?.revokedBoth);
        const latestMessageRevokedByBoth = revokedMessagesByBoth.reverse().find(msg => msg?.revoked?.revokedBoth);
        const latestRevokedIndex = userMessages.findIndex(msg => msg?.id === latestMessageRevokedByBoth?.id);
        const latestNonRevokedIndex = userMessages.findIndex(
            msg => msg?.id === nonRevokedMessages[nonRevokedMessages.length - 1]?.id
        );

        if (firstNonRevokedByOtherUser) {
            if (latestNonRevokedIndex > latestRevokedIndex) {
                lastMessage = userMessages[latestNonRevokedIndex];
            } else if (latestRevokedIndex !== -1 && !userMessages[latestRevokedIndex]?.revoked?.revokedBy?.includes(currentUserName)) {
                lastMessage = {
                    message: `${userMessages[latestRevokedIndex].senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            } else if (messagesRevokedByCurrentUser.length === userMessages.length) {
                lastMessage = { message: 'History was cleared' };
            }
        } else {
            if (lastMessage?.revoked?.revokedBoth && !lastMessage?.revoked?.revokedBy?.includes(currentUserName)) {
                lastMessage = {
                    message: `${lastMessage.senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            } else if (messagesRevokedByCurrentUser.length === userMessages.length) {
                lastMessage = { message: 'History was cleared' };
            } else if (nonRevokedMessages.length === 1 && !firstMessageRevokedByBoth) {
                lastMessage = nonRevokedMessages[0];
            } else if (nonRevokedMessages.length > 1 && !latestMessageRevokedByBoth) {
                lastMessage = nonRevokedMessages[nonRevokedMessages.length - 1];
            } else if (firstMessageRevokedByBoth && nonRevokedMessages.length === 0) {
                lastMessage = {
                    message: `${firstMessageRevokedByBoth.senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            } else if (latestNonRevokedIndex > latestRevokedIndex) {
                lastMessage = userMessages[latestNonRevokedIndex];
            } else if (latestNonRevokedIndex < latestRevokedIndex) {
                lastMessage = {
                    message: `${firstMessageRevokedByBoth.senderUserName === currentUserName ? 'Bạn' : userName} đã thu hồi một tin nhắn`
                };
            }
        }

        if (firstSeenMessageIndex !== -1 && userMessages[userMessages.length - 1].senderUserName !== currentUserName) {
            unseenMessageCount = userMessages.slice(firstSeenMessageIndex + 1).length;
        } else if (firstSeenMessageIndex === 1 && userMessages[userMessages.length - 1].senderUserName !== currentUserName) {
            unseenMessageCount = userMessages.slice(firstSeenMessageIndex).length;
        } if (firstSeenMessageIndex === -1 && userMessages[userMessages.length - 1].senderUserName !== currentUserName) {
            unseenMessageCount = userMessages.length;
        } else if (firstSeenMessageIndex === -1 && userMessages[userMessages.length - 1].senderUserName === currentUserName) {
            unseenMessageCount = 0;
        }

        return { lastMessage, unseenMessageCount };
    };

    const shouldDisplayMessage = (lastMessage, unreadMessageCount) => {
        if (Object.keys(lastMessage).length > 1) {
            if (lastMessage.message.includes(`${lastMessage.senderUserName} đã thu hồi một tin nhắn`)) {
                return false;
            }
        } else {
            if (!lastMessage.message.includes(`Bạn đã thu hồi một tin nhắn`) && unreadMessageCount > 0) {
                return false;
            }

            return true;
        }
    };

    const renderSeenStatus = (lastMessage, currentUserName, incomingMessage, messageHistory) => {
        if (Object.keys(incomingMessage).length === 5) {
            const originIndex = incomingMessage.listMessage.findIndex(
                (msg) => msg.id === incomingMessage.originMessage.id
            );

            if (incomingMessage.originMessage.senderUserName !== currentUserName) {
                return;
            }

            if (originIndex < incomingMessage.listMessage.length) {
                return <DoneAllIcon sx={{ fontSize: 14, mb: 0.3 }} />;
            } else {
                return <DoneIcon sx={{ fontSize: 14, mb: 0.3 }} />;
            }
        }

        if (lastMessage.senderUserName !== currentUserName) {
            return null;
        }

        const lastMessageIndex = messageHistory.findIndex(
            (message) => message.id === lastMessage.id
        );

        if (lastMessageIndex === messageHistory.length - 1) {
            return lastMessage.seen ? (
                <DoneAllIcon sx={{ fontSize: 14, mb: 0.3 }} />
            ) : (
                <DoneIcon sx={{ fontSize: 14, mb: 0.3 }} />
            );
        }

        return lastMessageIndex < messageHistory.length - 1 ? (
            <DoneAllIcon sx={{ fontSize: 14, mb: 0.3 }} />
        ) : (
            <DoneIcon sx={{ fontSize: 14, mb: 0.3 }} />
        );
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

        const handleUserData = (userData) => {
            setChatMessageHistory(userData.messageHistory);
        };

        const handleCarouselDataUpdate = (carouselData) => {
            setCarouselSlides(carouselData);
        };

        socket.current.emit('getUserData', currentUserName);
        socket.current.on('connect', () => {
            socket.current.emit('chatEvent', { socketId: socket.current.id, userName: userData.data.user.userName, type: 'register' });
        });

        socket.current.on('notification', notificationData);
        socket.current.on('readMessages', readMessages);
        socket.current.on('receiveUserData', handleUserData)
        socket.current.on('messageHistoryUpdate', messageHistory);
        socket.current.on('carouselDataUpdate', handleCarouselDataUpdate);

        return () => {
            socket.current.off('readMessages', readMessages);
            socket.current.off('notification', notificationData);
            socket.current.off('receiveUserData', handleUserData);
            socket.current.off('messageHistoryUpdate', messageHistory);
            socket.current.off('carouselDataUpdate', handleCarouselDataUpdate);
        };
    }, [socket.current]);

    useEffect(() => {
        if (Object.keys(messageBackState).length > 0) {
            setChatMessageHistory(messageBackState);
        }
    }, [messageBackState]);

    useEffect(() => {
        if (carouselSlides.length < 1 && pinnedMessages.length > 0) {
            setCarouselSlides(pinnedMessages)
        }
    }, [userTarget]);

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
                                <BadgeAvatars />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" ml={0.7}>
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
                                            {renderSeenStatus(lastMessage, currentUserName, newMessage, chatMessageHistory[userName])}
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
                                            alignItems: 'center',
                                            ml: 0.7
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
                                                maxWidth: shouldDisplayMessage((newMessage || lastMessage), unseenMessageCount) ? '100%' : '85%'
                                            }}
                                        >
                                            {(newMessage.senderUserName === userName || newMessage.recipientUserName === userName) ? newMessage.message : lastMessage.message}
                                        </Typography>
                                        {lastMessage?.senderUserName !== currentUserName &&
                                            <Badge
                                                badgeContent={unseenMessageCount}
                                                color='primary' sx={{ mr: 1 }}
                                            />
                                        }
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

export default ConversationList;
