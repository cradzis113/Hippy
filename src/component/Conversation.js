import React, { useEffect, useState } from 'react';
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';

const n = [
    {
        url: "https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg",
        name: "Bình",
        message: "Một cảnh bình minh tuyệt đẹp với ánh sáng vàng ấm áp trên biển.",
        time: "11:30 AM",
        seen: true // Marked as seen
    },
    {
        url: "https://images.pexels.com/photos/2345678/pexels-photo-2345678.jpeg",
        name: "Khang",
        message: "Cảnh rừng xanh tươi mát với ánh sáng mặt trời chiếu qua những tán lá.",
        time: "Yesterday",
        seen: false // Not seen
    },
    {
        url: "https://images.pexels.com/photos/3456789/pexels-photo-3456789.jpeg",
        name: "Hào",
        message: "Toàn cảnh thành phố về đêm với những ánh đèn sáng rực rỡ.",
        time: "2:45 PM",
        seen: true // Marked as seen
    },
    {
        url: "https://images.pexels.com/photos/4567890/pexels-photo-4567890.jpeg",
        name: "Duy",
        message: "Cận cảnh một bông hoa màu sắc tươi sáng, nổi bật với chi tiết tinh tế.",
        time: "3 days ago",
        seen: false // Not seen
    },
    {
        url: "https://images.pexels.com/photos/4567890/pexels-photo-4567890.jpeg",
        name: "Duy",
        message: "Cận cảnh một bông hoa màu sắc tươi sáng, nổi bật với chi tiết tinh tế.",
        time: "3 days ago",
        seen: false // Not seen
    },
];

const Conversation = () => {
    const socket = useSocket()
    const { userData } = useAuth()
    const { messageHistory } = userData?.data?.user
    const { setCurrentChatUser, setSearchResult } = useData();
    const [c, setC] = useState('')

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

                    const userName = userData.data.user.userName
                    socket.current.emit('chatEvent',
                        { recipientUserName: results[0].userName, recipientSocketId: results[0].socketId, userName: userName, socketId: socket.current.id, type: 'chatRequest' }
                    );
                }
            })
        }
    }

    useEffect(() => {
        if (!socket.current) return;

        const handleMessageSent = (data) => {
            console.log(data)
            setC(data)
        }

        socket.current.on('connect', () => {
            socket.current.emit('chatEvent', { socketId: socket.current.id, userName: userData.data.user.userName, type: 'register' })
        })

        socket.current.on('cee', handleMessageSent);
        return () => {
            socket.current.off('cee', handleMessageSent);
        };
    }, [socket.current])

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
                {Object.keys(messageHistory).map((userName, index) => {
                    const userMessages = messageHistory[userName];
                    const lastMessage = userMessages[userMessages.length - 1];

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
                                <Avatar alt={userName} src={lastMessage.url} sx={{ width: 54, height: 54, mr: 2 }} />
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
                                            {lastMessage.seen ? (
                                                <DoneAllIcon sx={{ fontSize: 14, mb: 0.3 }} />
                                            ) : (
                                                <DoneIcon sx={{ fontSize: 14, mb: 0.3 }} />
                                            )}
                                            <Typography
                                                variant="caption"
                                                component="span"
                                                sx={{ color: 'text.secondary', ml: 0.5 }}
                                            >
                                                {formatTime(lastMessage.time)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {c.senderUserName === userName ? String(c.message) : String(lastMessage.message)}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};


export default Conversation;
