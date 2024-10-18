import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { lightBlue } from '@mui/material/colors';
import {
    Box,
    InputAdornment,
    TextField,
    Typography,
    IconButton,
    Chip,
    ListItem,
    ListItemText,
    List
} from '@mui/material';
import moment from 'moment';
import EmojiPicker from 'emoji-picker-react';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import useEmojiPicker from '../../hook/useEmojiPicker';
import useSendMessage from '../../hook/UseSendMessage';
import MessageItem from './MessageItem';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';

const MessageList = ({ user }) => {
    const socket = useSocket();
    const { userData } = useAuth();

    const { message, setMessage, sendMessage, userReplied, setUserReplied, messageReplied, setMessageReplied } = useSendMessage();
    const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef, handleEmojiClick } = useEmojiPicker();

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
                                primary={
                                    <Typography variant='body2'>
                                        {`Reply to ${userReplied}`}
                                    </Typography>
                                }
                                secondary={
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 1,
                                            textOverflow: 'ellipsis',
                                            maxWidth: '93%'
                                        }}
                                    >
                                        {messageReplied}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                )}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '16px',
                    }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={10}
                        value={message}
                        autoComplete="off"
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
                                            <EmojiEmotionsOutlinedIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: '16px',
                                '& fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'transparent',
                                },
                            },
                        }}
                    />
                    <Box
                        sx={{
                            margin: 2,
                            height: 50,
                            width: 50,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        {message ? (
                            <IconButton
                                onClick={handleSendMessage}
                                sx={{
                                    padding: 2,
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        backgroundColor: lightBlue['A400'],
                                        '& .MuiSvgIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        ) : (
                            <IconButton
                                sx={{
                                    padding: 2,
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        backgroundColor: lightBlue['A400'],
                                        '& .MuiSvgIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <MicIcon />
                            </IconButton>
                        )}
                    </Box>
                </Box>
                {showEmojiPicker && (
                    <Box ref={emojiPickerRef} sx={{ position: 'absolute', bottom: '100%', left: 0, my: 2 }}>
                        <EmojiPicker onEmojiClick={(event) => handleEmojiClick(event, setMessage)} />
                    </Box>
                )}
            </Box>
        </Box >
    );
};

export default MessageList;
