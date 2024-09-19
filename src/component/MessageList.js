import React, { useEffect, useState } from 'react';
import { Box, InputAdornment, TextField, Typography, IconButton, Tooltip } from '@mui/material';
import { green, lightBlue } from '@mui/material/colors';
import EmojiPicker from 'emoji-picker-react';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import useSendMessage from '../hook/UseSendMessage';
import useEmojiPicker from '../hook/useEmojiPicker';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const MessageList = ({ user }) => {
    const [messages, setMessages] = useState([]);

    const socket = useSocket();
    const { userData } = useAuth();
    const { message, setMessage, sendMessage } = useSendMessage();
    const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef, handleEmojiClick } = useEmojiPicker();

    const currentUser = userData?.data?.user?.userName;

    useEffect(() => {
        const { otherUsers } = userData?.data?.user || {};

        if (!otherUsers) return setMessages([]);

        const userMessages = otherUsers[user.userName];
        if (userMessages && user.otherUsers[currentUser]) {
            setMessages(user.otherUsers[currentUser]);
        }
    }, [userData, user, currentUser]);

    useEffect(() => {
        if (!socket) return;

        const handleMessageSent = (data) => {
            const { otherUsers } = data;

            Object.keys(otherUsers).forEach((userName) => {
                const newMessages = otherUsers[userName];
                if (userName === user.userName || userName === currentUser) {
                    setMessages(newMessages);
                }
            });
        };

        socket.on('messageSent', handleMessageSent);

        return () => {
            socket.off('messageSent', handleMessageSent);
        };
    }, [socket, user, currentUser]);

    const handleSendMessage = () => {
        if (message.trim()) sendMessage(user.userName);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '92vh', overflow: 'hidden' }}>
            <Box
                sx={{
                    mt: 2,
                    flexGrow: 1,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '5px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#888',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#555',
                    },
                }}
            >
                {messages.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: 650,
                            padding: 1,
                            display: 'flex',
                            margin: '0 auto',
                            flexDirection: item.senderUserName === currentUser ? 'row-reverse' : 'row',
                        }}
                    >
                        <Tooltip title={item.time[4]} placement="left">
                            <Box
                                sx={{
                                    backgroundColor: item.name === currentUser ? green[400] : 'background.paper',
                                    padding: '6px 12px',
                                    borderRadius: '10px',
                                    maxWidth: '70%',
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: item.name === currentUser ? 'white' : 'black',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {item.message}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                ))}
            </Box>
            <Box
                sx={{
                    width: 650,
                    display: 'flex',
                    margin: '0 auto',
                    position: 'relative',
                    alignItems: 'center',
                    borderRadius: '16px',
                }}
            >
                <TextField
                    fullWidth
                    autoComplete="off"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    multiline
                    maxRows={10}
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
                {showEmojiPicker && (
                    <Box ref={emojiPickerRef} sx={{ position: 'absolute', bottom: '100%', left: 0, my: 2 }}>
                        <EmojiPicker onEmojiClick={(event) => handleEmojiClick(event, setMessage)} />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default MessageList;
