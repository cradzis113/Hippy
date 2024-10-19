import React from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import EmojiPicker from 'emoji-picker-react';
import useEmojiPicker from '../../hook/useEmojiPicker';

const MessageInput = ({ message, setMessage, handleSendMessage, showEmojiPicker, setShowEmojiPicker }) => {
    const { emojiPickerRef, handleEmojiClick } = useEmojiPicker();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: '16px' }}>
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
                    },
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
                                backgroundColor: 'lightblue',
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
                                backgroundColor: 'lightblue',
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
    );
};

export default MessageInput;
