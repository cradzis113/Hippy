import React from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { EmojiEmotions as EmojiEmotionsIcon, Send as SendIcon, Mic as MicIcon } from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import useEmojiPicker from '../../hook/useEmojiPicker';
import useMessageStore from '../../stores/messageStore';
import useSocketStore from '../../stores/socketStore';

const MessageInput = ({ userTarget, currentUser, showEmojiPicker, setShowEmojiPicker }) => {
    const { emojiPickerRef, handleEmojiClick } = useEmojiPicker();
    const socket = useSocketStore(state => state.socket);
    const message = useMessageStore(state => state.message);
    const setMessage = useMessageStore(state => state.setMessage);
    const sendMessage = useMessageStore(state => state.sendMessage);

    const handleSendMessage = () => {
        if (message.trim()) sendMessage(userTarget.userName, currentUser, socket);
    };

    const commonIconButtonStyles = {
        padding: 2,
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'lightblue',
            '& .MuiSvgIcon-root': {
                color: 'white',
            },
        },
    };

    const textFieldStyles = {
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
    };

    const ActionButton = () => (
        <IconButton
            onClick={message ? handleSendMessage : undefined}
            sx={commonIconButtonStyles}
        >
            {message ? <SendIcon /> : <MicIcon />}
        </IconButton>
    );

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
                                    <EmojiEmotionsIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
                sx={textFieldStyles}
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
                <ActionButton />
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
