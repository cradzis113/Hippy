import React, { useEffect, useState, useMemo, memo } from 'react';
import { Badge, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BadgeAvatars from './BadgeAvatars';
import _ from 'lodash';
import authStore from '../../stores/authStore';
import useSocketStore from '../../stores/socketStore';
import useDataStore from '../../stores/dataStore';
import { useShallow } from 'zustand/react/shallow';

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

const ConversationItem = memo(({
    userName,
    lastMessage,
    unseenMessageCount,
    currentUserName,
    newMessage,
    onClick,
    messageHistory,
    messageQueueState
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
                <BadgeAvatars userName={userName} activeUsers={messageQueueState} />
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
    const socket = useSocketStore(state => state.socket);
    const userData = authStore(state => state.userData)
    const setUserData = authStore(state => state.setUserData)
    const userName = authStore(state => state.userName);

    const {
        setCurrentChatUser,
        setCarouselSlides,
        carouselSlides,
        storedMessages,
        setStoredMessages,
        currentChatUser
    } = useDataStore(useShallow(state => ({
        setCurrentChatUser: state.setCurrentChatUser,
        setCarouselSlides: state.setCarouselSlides,
        carouselSlides: state.carouselSlides,
        storedMessages: state.storedMessages,
        setStoredMessages: state.setStoredMessages,
        currentChatUser: state.currentChatUser
    })));

    const currentUserName = userName;
    const initialMessageHistory = userData?.data?.user?.messageHistory || {};
    const pinnedInfo = userData?.data?.user?.pinnedInfo || {};

    const [newMessage, setNewMessage] = useState('');
    const [chatMessageHistory, setChatMessageHistory] = useState(initialMessageHistory);
    const [userTarget, setUserTarget] = useState('');
    const [messageQueue, setMessageQueue] = useState([])

    const pinnedMessages = pinnedInfo[userTarget] || [];

    const handleClick = (userName) => {
        if (!socket) return;

        socket.emit('enterChat', { userName, currentUserName })
        socket.emit('search', userName, (error, results) => {
            if (error) {
                console.error('Search error:', error);
                return;
            }

            setUserTarget(results[0].userName);
            setCurrentChatUser(results[0]);
            socket.emit('chatEvent', {
                recipientUserName: results[0].userName,
                recipientSocketId: results[0].socketId,
                userName: currentUserName,
                socketId: socket.id,
                type: 'chatRequest'
            });
        });
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
        } else if (firstSeenMessageIndex === -1 && userMessages[userMessages.length - 1].senderUserName !== currentUserName) {
            unseenMessageCount = userMessages.length;
        } else if (firstSeenMessageIndex === -1 && userMessages[userMessages.length - 1].senderUserName === currentUserName) {
            unseenMessageCount = 0;
        }

        return { lastMessage, unseenMessageCount };
    };

    useEffect(() => {
        if (!socket || !userData?.data?.user) return;
        const handlers = {
            notification: setNewMessage,
            addMessagesToQueue: (newMessages) => {
                setMessageQueue((prevQueue) => _.uniq([...prevQueue, ...newMessages]));
            },
            removeMessageFromQueue: (messageToRemove) => {
                const updatedQueue = _.without(messageQueue, messageToRemove);
                setMessageQueue(updatedQueue);
            },
            messageHistoryUpdate: (updatedMessages, targetUser) => {
                setStoredMessages(prev => {
                    const uniqueMessages = _.uniqBy(
                        [...(prev[targetUser] || []), updatedMessages],
                        'id'
                    );

                    return {
                        ...prev,
                        [targetUser]: uniqueMessages
                    };
                });
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

                    const mergedMessages = [...prevHistory[targetUser], updatedMessages]
                    const uniqueMessages = _.uniqBy(mergedMessages.reverse(), 'id').reverse();
                    return ({
                        ...prevHistory,
                        [targetUser]: uniqueMessages
                    })
                })
            },
            readMessages: (updatedMessages, targetUser, index) => {
                setStoredMessages(prev => {
                    const uniqueMessages = _.uniqBy(
                        [...(prev[targetUser] || []), updatedMessages].reverse(),
                        'id'
                    );

                    return {
                        ...prev,
                        [targetUser]: uniqueMessages.reverse()
                    };
                });

                setChatMessageHistory(prevHistory => {
                    const cleanMessages = prevHistory[targetUser].map(message => {
                        const { seen, ...rest } = message;
                        return rest;
                    });

                    const mergedMessages = [...cleanMessages, updatedMessages]

                    if (index) {
                        mergedMessages[index].seen = true
                    }

                    const uniqueMessages = _.uniqBy(mergedMessages.reverse(), 'id').reverse();
                    return {
                        ...prevHistory,
                        [targetUser]: uniqueMessages
                    };
                });
            },
            recipientUserUpdate: (data) => {
                setUserData({ data: { user: data } })
            },
            carouselDataUpdate: (data) => {
                const currentState = useDataStore.getState();
                if (data.type === 'pin') {
                    const uniqueMessages = _.uniqBy(
                        [...currentState.carouselSlides, data],
                        'id'
                    );
                    setCarouselSlides(uniqueMessages);
                } else {
                    const filteredMessages = _.filter(currentState.carouselSlides, (msg) => msg.id !== data.id)
                    setCarouselSlides(filteredMessages);
                }
            },
            unseenMessages: (data) => {
                const mergeChatMessages = (currentHistory, newData) => {
                    return Object.keys(currentHistory).reduce((acc, curr) => {
                        const existingMessages = newData[curr] || [];
                        const newMessages = (currentHistory[curr] || []).filter(newMsg =>
                            !existingMessages.some(
                                existingMsg => existingMsg.id === newMsg.id
                            )
                        );
                        acc[curr] = [...newMessages, ...existingMessages];
                        return acc;
                    }, {});
                };

                setChatMessageHistory(prevHistory => mergeChatMessages(prevHistory, data));
            },
            updateSeenStatus: (data) => {
                setChatMessageHistory(prevHistory => {
                    const i = { ...prevHistory }
                    delete i[data.user][data.indexSeen].seen

                    _.last(i[data.user]).seen = true
                    return i
                })
            }
        };

        socket.on("connect", () => {
            socket.emit('chatEvent', {
                socketId: socket.id,
                userName: currentUserName,
                type: 'register'
            });
        });

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.keys(handlers).forEach(event => {
                socket.off(event);
            });
        };
    }, [socket, messageQueue]);

    useEffect(() => {
        console.log(carouselSlides)
    }, [carouselSlides])

    useEffect(() => {
        const result = _.mergeWith({}, chatMessageHistory, storedMessages, (objValue, srcValue) => {
            objValue = objValue || [];
            srcValue = srcValue || [];

            const merged = _.unionWith(objValue, srcValue, (a, b) => a.id === b.id);
            return merged.map((msg, index, arr) => {
                if (index === arr.length - 1 && msg.seen) {
                    return msg;
                }

                if (!arr[arr.length - 1].seen) {
                    const lastSeenIndex = _.findLastIndex(arr,
                        (m) => m.seen
                    );

                    if (lastSeenIndex === index) {
                        return msg;
                    }
                }

                const { seen, ...rest } = msg;
                return rest;
            });
        });

        setChatMessageHistory(result);
    }, [])

    useEffect(() => {
        if (carouselSlides.length < 1 && pinnedMessages.length > 0) {
            setCarouselSlides(pinnedMessages);
        }
    }, [userTarget]);

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
                        currentChatUser={currentChatUser}
                        messageQueueState={messageQueue}
                    />
                ))}
            </List>
        </Box>
    );
};

export default ConversationList;
