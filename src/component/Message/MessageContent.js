import { Box, Typography } from '@mui/material';
import ReplyMessage from './ReplyMessage';

const MessageContent = ({ item, currentUser }) => {
    return (
        <Box
            sx={{
                color: item.name === currentUser ? 'white' : 'black',
                wordBreak: 'break-all',
            }}
        >
            {item.replyInfo ? (
                <>
                    <ReplyMessage replyInfo={item.replyInfo} />
                    <Typography variant="body1">{item.message}</Typography>
                </>
            ) : (
                <Typography variant="body1">{item.message}</Typography>
            )}
        </Box>
    );
};

export default MessageContent;
