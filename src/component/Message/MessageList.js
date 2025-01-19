import React, { useEffect, useState, useRef } from 'react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';

import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useData } from '../../context/DataContext';
import { useSetting } from '../../context/SettingContext';

import moment from 'moment';

import MessageDeletionNotification from './MessageDeletionNotification';
import useSendMessage from '../../hook/UseSendMessage';
import MessageSelectionBar from './MessageSelectionBar';

import CloseIcon from '@mui/icons-material/Close';
import ReplyIcon from '@mui/icons-material/Reply';
import { RadioButtonUnchecked, RadioButtonChecked } from '@mui/icons-material';
import { Box, Chip, ListItem, ListItemText, List, IconButton, ListItemIcon, Typography, Checkbox } from '@mui/material';
import _ from 'lodash';

const MessageList = ({ user }) => {
    const socket = useSocket();
    const { userData } = useAuth();

    const {
        message,
        setMessage,
        sendMessage,
        userReplied,
        setUserReplied,
        messageReplied,
        setMessageReplied
    } = useSendMessage();

    const [messages, setMessages] = useState([]);
    const currentUser = userData?.data?.user?.userName;
    const [currentUserMessageHistory, setCurrentUserMessageHistory] = useState([]);
    const currentUserMessageHistoryLength = useRef(currentUserMessageHistory.length);

    const { activeSelectedMessage, fi, setFi } = useSetting();
    const { selectedMessages, setSelectedMessages, focusMessage, storedMessages, currentChatUser } = useData();

    const messagesEndRef = useRef(null);
    const [isExpanding, setIsExpanding] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
        if (!socket.current) return;
        const handleMessageSent = (data) => {
            if (!data) {
                return setMessages([]);
            }

            setCurrentUserMessageHistory(prev => [...prev, data])
        };

        socket.current.on('messageSent', handleMessageSent);
        return () => {
            socket.current.off('messageSent', handleMessageSent);
        };
    }, [socket.current]);

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

            const shrinkTimer = setTimeout(() => {
                setIsExpanding(false);
            }, 2000);

            const clearTimer = setTimeout(() => {
                setHighlightedMessageId(null);
            }, 2300);

            return () => {
                clearTimeout(shrinkTimer);
                clearTimeout(clearTimer);
            };
        }
    }, [focusMessage]);

    useEffect(() => {
        if (messages[messages.length - 1]?.messages && _.size(storedMessages[currentChatUser.userName]) > 0 && !fi) {
            const newMessages = _.differenceBy(storedMessages[currentChatUser.userName], messages[messages.length - 1].messages, 'id');
            if (newMessages.length > 0) {
                const updatedMessages = [...messages];

                updatedMessages[updatedMessages.length - 1] = {
                    ...updatedMessages[updatedMessages.length - 1],
                    messages: [...updatedMessages[updatedMessages.length - 1].messages, ...newMessages]
                };

                setFi(true)
                setMessages(updatedMessages);
            }
        }
    }, [messages, currentChatUser, storedMessages, fi]);

    const handleSendMessage = () => {
        if (message.trim()) sendMessage(user.userName, messageReplied, userReplied);
    };

    const handleCloseReliedMessage = () => {
        setMessageReplied(null);
        setUserReplied(null);
    };

    const hasVisibleMessageInFirstGroup = messages[0]?.messages?.some(
        message => message?.revoked?.revokedBy?.includes(currentUser)
    );

    const allMessages = messages.flatMap(item => item.messages);
    const recentVisibleMessage = allMessages.find(message => !message?.revoked?.revokedBy?.includes(currentUser));

    const handleRadioChange = (event, message) => {
        const isSelected = selectedMessages.some(msg => msg.id === message.id);

        if (isSelected) {
            setSelectedMessages(selectedMessages.filter(msg => msg.id !== message.id));
        } else {
            setSelectedMessages([...selectedMessages, message]);
        }
    };

    const calculateMessagePosition = (item) => {
        if (_.isEmpty(selectedMessages)) {
            return item.senderUserName === currentUser ? 620 : 650
        } else {
            return 650
        }
    }

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

                    {(!hasVisibleMessageInFirstGroup || recentVisibleMessage) && messages.map((dayGroup, index) => {
                        const hasVisibleMessageInDayGroup = dayGroup.messages.some(
                            message => !message?.revoked?.revokedBy?.includes(currentUser)
                        );

                        return (
                            <React.Fragment key={index}>
                                {hasVisibleMessageInDayGroup && (
                                    <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', position: 'sticky', top: 0 }}>
                                        <Chip label={moment(dayGroup.time).format('MMMM D')} sx={{ bgcolor: '#a5d6a7', color: 'background.paper' }} />
                                    </Box>
                                )}
                                {dayGroup.messages.map((item, msgIndex) => (
                                    <React.Fragment key={msgIndex}>
                                        {!item?.revoked?.revokedBy?.includes(currentUser) && (
                                            <Box
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
                                                        width: calculateMessagePosition(item),
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
                                ))}
                            </React.Fragment>
                        );
                    })}
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
                                <IconButton aria-label="close" onClick={handleCloseReliedMessage}>
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
                                        <Typography variant='body2' color='#e040fb' fontWeight={'bold'}>{userReplied}</Typography>
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
                        message={message}
                        setMessage={setMessage}
                        handleSendMessage={handleSendMessage}
                        showEmojiPicker={showEmojiPicker}
                        setShowEmojiPicker={setShowEmojiPicker}
                    />
                )}
            </Box>
        </Box>
    );
};

export default MessageList;
