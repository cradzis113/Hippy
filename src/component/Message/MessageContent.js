import React from 'react';
import { Box, Typography } from '@mui/material';
import ReplyMessage from './ReplyMessage';
import MessageTooltip from './MessageTooltip';

const MessageContent = ({ item, currentUser, formatTime }) => {
    return (
        <Box
            sx={{
                color: item.name === currentUser ? 'white' : 'black',
                wordBreak: 'break-all',
            }}
        >
            {item.replyInfo ? (
                <MessageTooltip title={formatTime(item.time)}>
                    <Box>
                        <ReplyMessage replyInfo={item.replyInfo} />
                        <Typography variant="body1">{item.message}</Typography>
                    </Box>
                </MessageTooltip>
            ) : (
                <MessageTooltip title={formatTime(item.time)}>
                    <Typography variant="body1">{item.message}</Typography>
                </MessageTooltip>
            )}
        </Box>
    );
};

export default MessageContent;
