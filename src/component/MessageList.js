import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { green, lightBlue } from '@mui/material/colors';
import {
    Box,
    InputAdornment,
    TextField,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    Popper,
    List,
    ListItem,
    ListItemText,
    Popover,
    ListItemButton
} from '@mui/material';
import moment from 'moment';
import EmojiPicker from 'emoji-picker-react';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import useEmojiPicker from '../hook/useEmojiPicker';
import useSendMessage from '../hook/UseSendMessage';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';

const MessageList = ({ user }) => {
    const socket = useSocket();
    const { userData } = useAuth();

    const { message, setMessage, sendMessage, userReplied, setUserReplied, messageReplied, setMessageReplied } = useSendMessage();
    const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef, handleEmojiClick } = useEmojiPicker();

    const [messages, setMessages] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentAnchorEl, setCurrentAnchorEl] = useState(null);
    const [dotAnchor, setDotAnchor] = useState(null);

    const currentUser = userData?.data?.user?.userName;

    useEffect(() => {
        const messageHistory = user?.messageHistory;

        if (!messageHistory || !messageHistory[currentUser]) {
            setMessages([]);
            return;
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


    const handlePopoverOpen = (element, index) => {
        setAnchorEl(index);
        setCurrentAnchorEl(element);
    };

    const handlePopoverClose = () => {
        setCurrentAnchorEl(null);
        setAnchorEl(null);
    };

    const handleReply = (replyData) => {
        setUserReplied(replyData.senderUserName);
        setMessageReplied(replyData.message);
    };

    const nb = (event) => {
        setDotAnchor(event.currentTarget)
    }

    const cl = () => {
        setDotAnchor(null)
    }

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
                    <Box key={index}>
                        <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', position: 'sticky', top: 0 }}>
                            <Chip label={moment(dayGroup.time).format('MMMM D')} />
                        </Box>
                        {dayGroup.messages.map((item, msgIndex) => (
                            <Box
                                key={msgIndex}
                                sx={{
                                    width: 650,
                                    padding: 1,
                                    display: 'flex',
                                    margin: '0 auto',
                                    flexDirection: item.senderUserName === currentUser ? 'row-reverse' : 'row',
                                }}
                            >
                                <Box
                                    sx={{
                                        backgroundColor: item.name === currentUser ? green[400] : 'background.paper',
                                        padding: '6px 12px',
                                        borderRadius: '10px',
                                        maxWidth: '70%',
                                    }}
                                    onMouseLeave={handlePopoverClose}
                                    onMouseEnter={(event) => handlePopoverOpen(event.currentTarget, item._id)}
                                >
                                    <Tooltip
                                        title={formatTime(item.time)}
                                        placement="left"
                                        slotProps={{
                                            popper: {
                                                modifiers: [
                                                    {
                                                        name: 'offset',
                                                        options: {
                                                            offset: [0, 5],
                                                        },
                                                    },
                                                ],
                                            },
                                        }}
                                    >
                                        {item.replyInfo ? (
                                            <Box>
                                                <Box
                                                    sx={{
                                                        pr: 2,
                                                        mb: '2px',
                                                        display: 'flex',
                                                        bgcolor: '#f5f5f5',
                                                        overflow: 'hidden',
                                                        borderRadius: 1.5,
                                                        wordBreak: 'break-all',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 3,
                                                            bgcolor: '#009688',
                                                            mr: '5px',
                                                            flexShrink: 0, // Đảm bảo rằng phần màu không bị co lại
                                                        }}
                                                    ></Box>
                                                    <Box
                                                        sx={{
                                                            wordBreak: 'break-all',
                                                            flexGrow: 1,
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {item.replyInfo.userReplied}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {item.replyInfo.messageReplied}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        color: item.name === currentUser ? 'white' : 'black',
                                                        wordBreak: 'break-all',
                                                    }}
                                                >
                                                    <Typography variant='body1'>{item.message}</Typography>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: item.name === currentUser ? 'white' : 'black',
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {item.message}
                                            </Typography>
                                        )}
                                    </Tooltip>
                                    <Popper
                                        open={anchorEl === item._id}
                                        anchorEl={currentAnchorEl}
                                        placement="right"
                                        disablePortal={true}
                                        onMouseEnter={() => handlePopoverOpen(currentAnchorEl, item._id)}
                                        modifiers={[
                                            {
                                                name: 'flip',
                                                enabled: true,
                                                options: {
                                                    altBoundary: true,
                                                    rootBoundary: 'document',
                                                    padding: 8,
                                                },
                                            },
                                            {
                                                name: 'preventOverflow',
                                                enabled: true,
                                                options: {
                                                    altAxis: true,
                                                    altBoundary: true,
                                                    tether: true,
                                                    rootBoundary: 'document',
                                                    padding: 8,
                                                },
                                            },
                                        ]}
                                    >
                                        <Box>
                                            <Tooltip title='Trả lời' placement='top' onClick={() => handleReply(item)}>
                                                <IconButton>
                                                    <ReplyOutlinedIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xem thêm" placement="top">
                                                <IconButton onClick={nb}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Popover
                                                open={Boolean(dotAnchor)}
                                                anchorEl={dotAnchor}
                                                onClose={cl}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'center',
                                                }}
                                            >
                                                <List sx={{ width: 150 }} >
                                                    <ListItem disablePadding>
                                                        <ListItemButton>
                                                            <Typography variant='body1'>Ghim</Typography>
                                                        </ListItemButton>
                                                    </ListItem>
                                                    <ListItem disablePadding>
                                                        <ListItemButton>
                                                            <Typography variant='body1'>Thu hồi</Typography>
                                                        </ListItemButton>
                                                    </ListItem>
                                                    <ListItem disablePadding>
                                                        <ListItemButton>
                                                            <Typography variant='body1' whiteSpace={'nowrap'}>Chuyển tiếp</Typography>
                                                        </ListItemButton>
                                                    </ListItem>
                                                </List>
                                            </Popover>
                                        </Box>
                                    </Popper>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ))
                }
            </Box >
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
                                <IconButton aria-label="comment">
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
