import React, { useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';

import { useAuth } from '../../context/AuthContext';
import useSendMessage from '../../hook/UseSendMessage';
import { useSocket } from '../../context/SocketContext';

import moment from 'moment';
import { Box, Chip, ListItem, ListItemText, List, IconButton, ListItemIcon, Typography, Checkbox } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageDeletionNotification from './MessageDeletionNotification';
import ReplyIcon from '@mui/icons-material/Reply';
import { RadioButtonUnchecked, RadioButtonChecked } from '@mui/icons-material';
import { useSetting } from '../../context/SettingContext';
import MessageSelectionBar from './MessageSelectionBar';
import { useData } from '../../context/DataContext';

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
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const { activeSelectedMessage } = useSetting();
    const { selectedMessages, setSelectedMessages } = useData();

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
                                            <Box sx={{
                                                flex: 1,
                                                display: 'flex',
                                                justifyContent: item.senderUserName === currentUser ? 'flex-end' : 'flex-start'
                                            }}>
                                                <MessageItem
                                                    item={item}
                                                    currentUser={currentUser}
                                                    setUserReplied={setUserReplied}
                                                    setMessageReplied={setMessageReplied}
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    );
                })}
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
