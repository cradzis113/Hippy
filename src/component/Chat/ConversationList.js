import React, { useEffect, useState, useMemo, memo } from 'react';
import { Badge, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSocket } from '../../context/SocketContext';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BadgeAvatars from './BadgeAvatars';

// Utility functions
const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const [datePart, timePart] = timestamp.split(' ');
    if (!timePart) return '';
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
};

const shouldDisplayMessage = (lastMessage, unreadMessageCount) => {
    if (Object.keys(lastMessage).length > 1) {
        return !lastMessage.message.includes(`${lastMessage.senderUserName} đã thu hồi một tin nhắn`);
    }
    return !(!lastMessage.message.includes(`Bạn đã thu hồi một tin nhắn`) && unreadMessageCount > 0);
};

// Memoized conversation item component
const ConversationItem = memo(({
    userName,
    lastMessage,
    unseenMessageCount,
    currentUserName,
    newMessage,
    onClick,
    messageHistory
}) => {
    const renderSeenStatus = () => {
        if (Object.keys(newMessage).length === 5) {
            const originIndex = newMessage.listMessage.findIndex(
                (msg) => msg.id === newMessage.originMessage.id
            );

            if (newMessage.originMessage.senderUserName !== currentUserName) return null;

            return originIndex < newMessage.listMessage.length ?
                <DoneAllIcon sx={{ fontSize: 14, mb: 0.3 }} /> :
                <DoneIcon sx={{ fontSize: 14, mb: 0.3 }} />;
        }

        if (lastMessage.senderUserName !== currentUserName) return null;

        const lastMessageIndex = messageHistory.findIndex(
            (message) => message.id === lastMessage.id
        );

        if (lastMessageIndex === messageHistory.length - 1) {
            return lastMessage.seen ?
                <DoneAllIcon sx={{ fontSize: 14, mb: 0.3 }} /> :
                <DoneIcon sx={{ fontSize: 14, mb: 0.3 }} />;
        }

        return lastMessageIndex < messageHistory.length - 1 ?
            <DoneAllIcon sx={{ fontSize: 14, mb: 0.3 }} /> :
            <DoneIcon sx={{ fontSize: 14, mb: 0.3 }} />;
    };

    return (
        <ListItem
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                    backgroundColor: '#f0f0f0',
                    cursor: 'pointer',
                },
            }}
            onClick={onClick}
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
                            {renderSeenStatus()}
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
                            {(newMessage.senderUserName === userName || newMessage.recipientUserName === userName)
                                ? newMessage.message
                                : lastMessage.message}
                        </Typography>
                        {lastMessage?.senderUserName !== currentUserName &&
                            <Badge
                                badgeContent={unseenMessageCount}
                                color='primary'
                                sx={{ mr: 1 }}
                            />
                        }
                    </Box>
                }
            />
        </ListItem>
    );
});

const ConversationList = () => {
    const socket = useSocket();
    const { userData } = useAuth();
    const { setCurrentChatUser, messageBackState, setCarouselSlides, carouselSlides } = useData();

    const currentUserName = userData?.data?.user?.userName || '';
    const initialMessageHistory = userData?.data?.user?.messageHistory || {};
    const pinnedInfo = userData?.data?.user?.pinnedInfo || {};

    const [newMessage, setNewMessage] = useState('');
    const [chatMessageHistory, setChatMessageHistory] = useState(initialMessageHistory);
    const [userTarget, setUserTarget] = useState('');

    const pinnedMessages = pinnedInfo[userTarget] || [];

    const handleClick = (userName) => {
        if (!socket) return;

        socket.current.emit('search', userName, (error, results) => {
            if (error) {
                console.error('Search error:', error);
                return;
            }

            setUserTarget(results[0].userName);
            setCurrentChatUser(results[0]);
            socket.current.emit('chatEvent', {
                recipientUserName: results[0].userName,
                recipientSocketId: results[0].socketId,
                userName: currentUserName,
                socketId: socket.current.id,
                type: 'chatRequest'
            });
        });
    };

    // Message processing logic remains the same
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

    // Socket effect
    useEffect(() => {
        if (!socket.current || !userData?.data?.user) return;
        const handlers = {
            notification: setNewMessage,
            messageHistoryUpdate: (updatedMessages, targetUser) => {
                setChatMessageHistory(prevHistory => {

                    if (Object.keys(prevHistory).length < 1) {
                        return { [targetUser]: [updatedMessages] }
                    }

                    if (!prevHistory[targetUser]) {
                        return {
                            ...prevHistory,
                            [targetUser]: [updatedMessages]
                        }
                    }

                    return ({
                        ...prevHistory,
                        [targetUser]: [...prevHistory[targetUser], ...messageBackState.messages, updatedMessages]
                    })


                })
            },
            readMessages: (updatedMessages, targetUser) => {
                const messageExists = chatMessageHistory[targetUser].some(i => i.id === updatedMessages.id);

                if (!messageExists) {
                    const cleanMessages = chatMessageHistory[targetUser].map(message => {
                        const { seen, ...rest } = message;
                        return rest;
                    });
                    setChatMessageHistory(prevHistory => ({
                        ...prevHistory,
                        [targetUser]: [...cleanMessages, updatedMessages]
                    }));
                }
            },
            // receiveUserData: (userData) => setChatMessageHistory(userData.messageHistory),
            carouselDataUpdate: setCarouselSlides
        };

        socket.current.on("connect", () => {
            socket.current.emit('getUserData', currentUserName);
            socket.current.emit('chatEvent', {
                socketId: socket.current.id,
                userName: currentUserName,
                type: 'register'
            });
        });

        socket.current.on('n', (data) => {
            setChatMessageHistory(prev => {
                const ke = Object.keys(prev);
                const h = ke.reduce((acc, curr) => {
                    acc[curr] = [...(prev[curr]), ...(data[curr])]; // Khởi tạo mảng rỗng nếu giá trị không tồn tại
                    return acc;
                }, {});
                return h;
            });

        })

        // Register handlers
        Object.entries(handlers).forEach(([event, handler]) => {
            socket.current.on(event, handler);
        });

        // Cleanup
        return () => {
            Object.keys(handlers).forEach(event => {
                socket.current.off(event);
            });
        };
    }, [socket.current]);

    // useEffect(() => {
    //     console.log(chatMessageHistory, 'useEf')
    // }, [chatMessageHistory])

    useEffect(() => {
        const user = messageBackState.user
        if (messageBackState.messages.length > 0 && user) {
            setChatMessageHistory(prevHistory => {
                let x
                if (prevHistory) {
                    x = ({
                        ...prevHistory,
                        [user]: [...prevHistory[user], ...messageBackState.messages]
                    })
                } else {
                    x = ({
                        ...chatMessageHistory,
                        [user]: [...chatMessageHistory[user], ...messageBackState.messages]
                    })
                }
                return x
            })
        }
    }, [messageBackState]);

    useEffect(() => {
        if (carouselSlides.length < 1 && pinnedMessages.length > 0) {
            setCarouselSlides(pinnedMessages);
        }
    }, [userTarget]);

    // Memoize processed messages
    const processedMessages = useMemo(() => {
        if (!chatMessageHistory) return [];
        return Object.keys(chatMessageHistory).map(userName => ({
            userName,
            ...processUserMessages(chatMessageHistory, userName, currentUserName)
        }));
    }, [chatMessageHistory, currentUserName]);

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
                {processedMessages.map(({ userName, lastMessage, unseenMessageCount }) => (
                    <ConversationItem
                        key={userName}
                        userName={userName}
                        lastMessage={lastMessage}
                        unseenMessageCount={unseenMessageCount}
                        currentUserName={currentUserName}
                        newMessage={newMessage}
                        onClick={() => handleClick(userName)}
                        messageHistory={chatMessageHistory[userName]}
                    />
                ))}
            </List>
        </Box>
    );
};

export default ConversationList;
