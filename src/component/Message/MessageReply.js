import { Box, Typography } from '@mui/material';

const MessageReply = ({ replyInfo }) => (
    <>
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
            <Box sx={{ width: 3, bgcolor: '#009688', mr: '5px', flexShrink: 0 }}></Box>
            <Box sx={{ wordBreak: 'break-all', flexGrow: 1, overflow: 'hidden' }}>
                <Typography
                    variant="body2"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {replyInfo.userReplied}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {replyInfo.messageReplied}
                </Typography>
            </Box>
        </Box>
    </>
);

export default MessageReply;
