import React, { useEffect, useState, useRef } from 'react';
import {
    Close as CloseIcon,
    Reply as ReplyIcon,
    RadioButtonUnchecked,
    RadioButtonChecked,
    KeyboardDoubleArrowDown as KeyboardDoubleArrowDownIcon
} from '@mui/icons-material';
import {
    Box,
    Chip,
    ListItem,
    ListItemText,
    List,
    IconButton,
    ListItemIcon,
    Typography,
    Checkbox
} from '@mui/material';
import _ from 'lodash';
import moment from 'moment';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import MessageDeletionNotification from './MessageDeletionNotification';
import useMessageStore from '../../stores/messageStore';
import MessageSelectionBar from './MessageSelectionBar';
import authStore from '../../stores/authStore';
import useSocketStore from '../../stores/socketStore';
import useSettingStore from '../../stores/settingStore';
import useDataStore from '../../stores/dataStore';
import { useShallow } from 'zustand/react/shallow';

const MessageDay = React.memo(({ 
    dayGroup, 
    currentUser, 
    activeSelectedMessage, 
    selectedMessages, 
    setSelectedMessages,
    setUserReplied,
    setMessageReplied,
    highlightedMessageId,
    isExpanding
}) => {
    const hasVisibleMessageInDayGroup = dayGroup.messages.some(
        message => !message?.revoked?.revokedBy?.includes(currentUser)
    );

    return (
        <React.Fragment>
            {hasVisibleMessageInDayGroup && (
                <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', position: 'sticky', top: 0 }}>
                    <Chip label={moment(dayGroup.time).format('MMMM D')} sx={{ bgcolor: '#a5d6a7', color: 'background.paper' }} />
                </Box>
            )}
            {dayGroup.messages.map((item, msgIndex) => (
                <MessageRow 
                    key={msgIndex}
                    item={item}
                    currentUser={currentUser}
                    activeSelectedMessage={activeSelectedMessage}
                    selectedMessages={selectedMessages}
                    setSelectedMessages={setSelectedMessages}
                    setUserReplied={setUserReplied}
                    setMessageReplied={setMessageReplied}
                    highlightedMessageId={highlightedMessageId}
                    isExpanding={isExpanding}
                />
            ))}
        </React.Fragment>
    );
});

const MessageRow = React.memo(({ 
    item, 
    currentUser, 
    activeSelectedMessage, 
    selectedMessages, 
    setSelectedMessages,
    setUserReplied,
    setMessageReplied,
    highlightedMessageId,
    isExpanding
}) => {
    const handleRadioChange = (event, message) => {
        const isSelected = selectedMessages.some(msg => msg.id === message.id);
        if (isSelected) {
            setSelectedMessages(selectedMessages.filter(msg => msg.id !== message.id));
        } else {
            setSelectedMessages([...selectedMessages, message]);
        }
    };

    return (
        <React.Fragment>
            {!item?.revoked?.revokedBy?.includes(currentUser) && (
                <Box
                    id={`message-${item.id}`}
                    sx={{
                        width: '100%',
                        margin: '0 auto',
                        position: 'relative',
                        overflow: 'hidden',
                        '@keyframes expandFromCenter': {
                            '0%': {
                                width: '0%',
                            },
                            '100%': {
                                width: '40%',
                            }
                        },
                        '@keyframes shrinkToCenter': {
                            '0%': {
                                width: '40%',
                            },
                            '100%': {
                                width: '0%',
                            }
                        },
                        '&::before, &::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            width: '0%',
                        },
                        '&::before': {
                            right: '50%',
                            borderTopLeftRadius: '10px',
                            borderBottomLeftRadius: '10px',
                            animation: highlightedMessageId === item.id ?
                                (isExpanding ? 'expandFromCenter 0.3s ease forwards' : 'shrinkToCenter 0.3s ease forwards')
                                : 'none',
                        },
                        '&::after': {
                            left: '50%',
                            borderTopRightRadius: '10px',
                            borderBottomRightRadius: '10px',
                            animation: highlightedMessageId === item.id ?
                                (isExpanding ? 'expandFromCenter 0.3s ease forwards' : 'shrinkToCenter 0.3s ease forwards')
                                : 'none',
                        }
                    }}
                >
                    <Box
                        sx={{
                            width: 650,
                            padding: 1,
                            display: 'flex',
                            margin: '0 auto',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        {activeSelectedMessage && (
                            <Checkbox
                                size="small"
                                checked={selectedMessages.some(msg => msg.id === item.id)}
                                onChange={(e) => handleRadioChange(e, item)}
                                icon={<RadioButtonUnchecked />}
                                checkedIcon={<RadioButtonChecked />}
                                sx={{
                                    marginRight: 1,
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 20
                                    }
                                }}
                            />
                        )}
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: item.senderUserName === currentUser ? 'flex-end' : 'flex-start',
                                borderRadius: '10px'
                            }}
                        >
                            <MessageItem
                                item={item}
                                currentUser={currentUser}
                                setUserReplied={setUserReplied}
                                setMessageReplied={setMessageReplied}
                            />
                        </Box>
                    </Box>
                </Box>
            )}
        </React.Fragment>
    );
});

const MessageList = ({ user }) => {
    const socket = useSocketStore(state => state.socket)
    const userName = authStore(state => state.userName);
    const setMessageReplied = useMessageStore(state => state.setMessageReplied);
    const setUserReplied = useMessageStore(state => state.setUserReplied);
    const userReplied = useMessageStore(state => state.userReplied);
    const messageReplied = useMessageStore(state => state.messageReplied);

    const currentUser = userName;
    const [messages, setMessages] = useState([]);
    const [currentUserMessageHistory, setCurrentUserMessageHistory] = useState([]);
    const currentUserMessageHistoryLength = useRef(currentUserMessageHistory.length);

    const activeSelectedMessage = useSettingStore(state => state.activeSelectedMessage);
    const isFirstLoad = useSettingStore(state => state.isFirstLoad);
    const setIsFirstLoad = useSettingStore(state => state.setIsFirstLoad);
    const hasEmittedSeen = useSettingStore(state => state.hasEmittedSeen);
    const setHasEmittedSeen = useSettingStore(state => state.setHasEmittedSeen);

    const {
        selectedMessages,
        setSelectedMessages,
        focusMessage,
        storedMessages,
        currentChatUser,
        setFocusMessage
    } = useDataStore(useShallow(state => ({
        selectedMessages: state.selectedMessages,
        setSelectedMessages: state.setSelectedMessages,
        focusMessage: state.focusMessage,
        storedMessages: state.storedMessages,
        currentChatUser: state.currentChatUser,
        setFocusMessage: state.setFocusMessage
    })));

    const messagesEndRef = useRef(null);
    const [isExpanding, setIsExpanding] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        if (!hasEmittedSeen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            const scrollContainer = messagesEndRef.current?.parentElement?.parentElement;
            if (scrollContainer) {
                handleScroll({ target: scrollContainer });
            }
        }
    };

    const handleScroll = _.debounce((e) => {
        const scrollTop = Math.abs(e.target.scrollTop);
        setShowScrollButton(scrollTop > 100);

        if (scrollTop > 100 && !hasEmittedSeen) {
            socket.emit('updateSeenStatus', { currentUser: currentUser, currentChatUser: currentChatUser.userName, seen: true });
            setHasEmittedSeen(true);
        } else if (scrollTop <= 100 && hasEmittedSeen) {
            socket.emit('updateSeenStatus', { currentUser: currentUser, currentChatUser: currentChatUser.userName, seen: false });
            setHasEmittedSeen(false);
        } else if (scrollTop <= 100 && !hasEmittedSeen) {
            socket.emit('updateSeenStatus', { currentUser: currentUser, currentChatUser: currentChatUser.userName, seen: false });
            setHasEmittedSeen(false);
        }
    }, 300);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const messageHistory = user?.messageHistory;
        if (!messageHistory || !messageHistory[currentUser]) {
            return setMessages([]);
        }

        const groupedMessages = _.groupBy(messageHistory[currentUser], msg => moment(msg.time).format('YYYY-MM-DD'));

        const formattedMessages = _.map(groupedMessages, (group) => ({
            time: _.minBy(group, 'time').time,
            messages: group,
        }));

        if (_.size(storedMessages[currentChatUser.userName]?.slice(1)) > 0) {
            setCurrentUserMessageHistory([...user.messageHistory[currentUser], ...storedMessages[currentChatUser.userName].slice(1)])
        } else {
            setCurrentUserMessageHistory(user.messageHistory[currentUser])
        }

        setMessages(formattedMessages);
    }, [user, currentUser]);

    useEffect(() => {
        if (!socket) return;

        const handleMessageSent = (data) => {
            if (!data) {
                return setMessages([]);
            }

            setCurrentUserMessageHistory(prevMessages => {
                if (data.revoked) {
                    const messageIndex = _.findIndex(prevMessages, msg => msg.id === data.id);
                    if (messageIndex !== -1) {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[messageIndex] = data;
                        return updatedMessages;
                    }
                    return prevMessages;
                }

                if (_.isArray(data)) {
                    return _.values({ ..._.keyBy(prevMessages, 'id'), ..._.keyBy(data, 'id') });
                }
                return [...prevMessages, data];
            });
        };

        const handleReactionUpdate = (data) => {
            if (data.type === 'add') {
                setCurrentUserMessageHistory(prevMessages => {
                    const messageIndex = _.findIndex(prevMessages, msg => msg.id === data.messageId);
                    if (messageIndex !== -1) {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[messageIndex].reactions = {
                            ...prevMessages[messageIndex].reactions,
                            [data.currentUser]: data.emoji
                        };
                        return updatedMessages;
                    }
                    return prevMessages;
                });
            } else if (data.type === 'remove') {
                setCurrentUserMessageHistory(prevMessages => {
                    const messageIndex = _.findIndex(prevMessages, msg => msg.id === data.messageId);
                    if (messageIndex !== -1) {
                        const updatedMessages = [...prevMessages];
                        delete updatedMessages[messageIndex].reactions[data.currentUser];
                        return updatedMessages;
                    }
                    return prevMessages;
                });
            }
        };

        socket.on('messageSent', handleMessageSent);
        socket.on('reactionUpdate', handleReactionUpdate);

        return () => {
            socket.off('messageSent', handleMessageSent);
            socket.off('reactionUpdate', handleReactionUpdate);
        };
    }, [socket]);

    useEffect(() => {
        if (currentUserMessageHistory.length === currentUserMessageHistoryLength) return;

        const groupedMessages = _.groupBy(currentUserMessageHistory, msg => moment(msg.time).format('YYYY-MM-DD'));
        const formattedMessages = _.map(groupedMessages, (group) => ({
            time: _.minBy(group, 'time').time,
            messages: group,
        }));

        setMessages(formattedMessages);
    }, [currentUserMessageHistoryLength, currentUserMessageHistory]);

    useEffect(() => {
        if (focusMessage) {
            setHighlightedMessageId(focusMessage.id);
            setIsExpanding(true);

            let retryCount = 0;
            const maxRetries = 5;

            const scrollToMessage = () => {
                const messageElement = document.getElementById(`message-${focusMessage.id}`);
                if (messageElement) {
                    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return true;
                }
                return false;
            };

            const attemptScroll = () => {
                if (scrollToMessage() || retryCount >= maxRetries) {
                    return;
                }

                retryCount++;
                setTimeout(attemptScroll, 100);
            };

            attemptScroll();

            const shrinkTimer = setTimeout(() => {
                setIsExpanding(false);
            }, 2000);

            const clearTimer = setTimeout(() => {
                setHighlightedMessageId(null);
                setFocusMessage(null);
            }, 2600);

            return () => {
                clearTimeout(shrinkTimer);
                clearTimeout(clearTimer);
            };
        }
    }, [focusMessage]);

    useEffect(() => {
        if (messages[messages.length - 1]?.messages && _.size(storedMessages[currentChatUser.userName]) > 0 && !isFirstLoad) {
            const newMessages = _.differenceBy(storedMessages[currentChatUser.userName], messages[messages.length - 1].messages, 'id');
            if (newMessages.length > 0) {
                const updatedMessages = [...messages];

                updatedMessages[updatedMessages.length - 1] = {
                    ...updatedMessages[updatedMessages.length - 1],
                    messages: [...updatedMessages[updatedMessages.length - 1].messages, ...newMessages]
                };

                setIsFirstLoad(true)
                setMessages(updatedMessages);
            }
        }
    }, [messages, currentChatUser, storedMessages, isFirstLoad]);

    const handleCloseReliedMessage = () => {
        setMessageReplied(null);
        setUserReplied(null);
    };

    const hasVisibleMessageInFirstGroup = messages[0]?.messages?.some(
        message => message?.revoked?.revokedBy?.includes(currentUser)
    );

    const allMessages = messages.flatMap(item => item.messages);
    const recentVisibleMessage = allMessages.find(message => !message?.revoked?.revokedBy?.includes(currentUser));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '92vh', overflow: 'hidden' }}>
            <Box
                sx={{
                    mt: 2,
                    flexGrow: 1,
                    display: 'flex',
                    overflowY: 'auto',
                    position: 'relative',
                    flexDirection: 'column-reverse',
                    '&::-webkit-scrollbar': { width: '5px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
                    '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
                }}
                onScroll={handleScroll}
            >
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: hasVisibleMessageInFirstGroup && !recentVisibleMessage ? '100%' : 'auto'
                }}>
                    {hasVisibleMessageInFirstGroup && !recentVisibleMessage && (
                        <Box sx={{ position: 'relative', top: '50%', transform: 'translateY(-50%)' }}>
                            <MessageDeletionNotification />
                        </Box>
                    )}

                    {(!hasVisibleMessageInFirstGroup || recentVisibleMessage) && messages.map((dayGroup, index) => (
                        <MessageDay
                            key={index}
                            dayGroup={dayGroup}
                            currentUser={currentUser}
                            activeSelectedMessage={activeSelectedMessage}
                            selectedMessages={selectedMessages}
                            setSelectedMessages={setSelectedMessages}
                            setUserReplied={setUserReplied}
                            setMessageReplied={setMessageReplied}
                            highlightedMessageId={highlightedMessageId}
                            isExpanding={isExpanding}
                        />
                    ))}
                    {showScrollButton && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'sticky', bottom: 3 }}>
                            <IconButton
                                onClick={scrollToBottom}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: 'white',
                                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                                    '&:hover': { backgroundColor: '#f5f5f5' }
                                }}>
                                <KeyboardDoubleArrowDownIcon />
                            </IconButton>
                        </Box>
                    )}
                    <Box ref={messagesEndRef} />
                </Box>
            </Box>
            <Box
                sx={{
                    width: 650,
                    margin: '0 auto',
                    position: 'relative',
                }}
            >
                {(messageReplied && userReplied) && (
                    <List sx={{ py: '5px', bgcolor: 'white', borderRadius: '8px' }}>
                        <ListItem
                            disablePadding
                            secondaryAction={
                                <IconButton onClick={handleCloseReliedMessage}>
                                    <CloseIcon />
                                </IconButton>
                            }
                        >
                            <ListItemIcon sx={{ minWidth: '40px', pl: 1 }}>
                                <ReplyIcon />
                            </ListItemIcon>
                            <Box
                                sx={{
                                    bgcolor: '#f3e5f5',
                                    borderRadius: 1.5,
                                    width: 'calc(100% - 100px)',
                                    position: 'relative',
                                    pl: 2,
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: 0,
                                        height: '100%',
                                        borderLeft: '4px solid #e040fb',
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant='body2' color='#e040fb' fontWeight='bold'>{userReplied}</Typography>
                                    }
                                    secondary={
                                        <Typography variant='body2' color='black'>{messageReplied}</Typography>
                                    }
                                />
                            </Box>
                        </ListItem>
                    </List>
                )}
                {activeSelectedMessage ? (
                    <MessageSelectionBar
                        selectedCount={selectedMessages.length}
                        item={selectedMessages}
                        currentUser={currentUser}
                    />
                ) : (
                    <MessageInput
                        userTarget={user}
                        currentUser={currentUser}
                        showEmojiPicker={showEmojiPicker}
                        setShowEmojiPicker={setShowEmojiPicker}
                    />
                )}
            </Box>
        </Box>
    );
};

export default MessageList;
