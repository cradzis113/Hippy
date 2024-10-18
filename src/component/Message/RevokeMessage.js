import { Box, Tooltip, Typography, Popper, IconButton } from '@mui/material';
import { green } from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';

const RevokeMessage = (
    {
        item,
        anchorEl,
        formatTime,
        currentUser,
        currentAnchorEl,
        handlePopoverOpen,
        handlePopoverClose,
        handleRetrieveMessages
    }) => {
    return (
        <Box
            sx={{
                backgroundColor: item.name === currentUser ? green[400] : 'background.paper',
                padding: '6px 12px',
                borderRadius: '10px',
                maxWidth: '70%',
            }}
            onMouseLeave={handlePopoverClose}
            onMouseEnter={(event) => handlePopoverOpen(event.currentTarget, item.id)}
        >
            <Tooltip
                title={formatTime(item.time)}
                placement="left"
                slotProps={{
                    popper: {
                        modifiers: [
                            { name: 'offset', options: { offset: [0, 5] } },
                        ],
                    },
                }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        color: item.name === currentUser ? 'white' : 'black',
                        wordBreak: 'break-all',
                    }}
                >
                    {item.revoked.revokedBoth === currentUser
                        ? 'Bạn đã thu hồi một tin nhắn'
                        : `${item.revoked.revokedBoth} đã thu hồi một tin nhắn`}
                </Typography>
            </Tooltip>
            <Popper
                open={anchorEl === item.id}
                anchorEl={currentAnchorEl}
                placement="right"
                disablePortal={true}
                onMouseEnter={() => handlePopoverOpen(currentAnchorEl, item.id)}
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
                <IconButton onClick={() => handleRetrieveMessages(item)}>
                    <DeleteIcon />
                </IconButton>
            </Popper>
        </Box>
    );
};

export default RevokeMessage;
