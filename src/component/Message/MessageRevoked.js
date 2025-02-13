import { Box, Typography, Popper, IconButton } from '@mui/material';
import { Delete as DeleteIcon, CheckCircleOutline as CheckCircleOutlineIcon } from '@mui/icons-material';
import { green } from '@mui/material/colors';
import MessageTooltip from './MessageTooltip';
import useSettingStore from '../../stores/settingStore';
import useDataStore from '../../stores/dataStore';

const MessageRevoked = ({
    item,
    anchorEl,
    formatTime,
    currentUser,
    currentAnchorEl,
    handlePopoverOpen,
    handlePopoverClose,
    handleRetrieveMessages
}) => {
    const setSelectedMessages = useDataStore(state => state.setSelectedMessages);
    const setActiveSelectedMessage = useSettingStore(state => state.setActiveSelectedMessage);

    const handleSelectMessage = () => {
        handlePopoverClose();
        setActiveSelectedMessage(true);
        setSelectedMessages(prev => [...prev, item]);
    };
    
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
            <MessageTooltip title={formatTime(item.time)}>
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
            </MessageTooltip>
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
                <IconButton onClick={() => handleRetrieveMessages(item, 'onlyYou')}>
                    <DeleteIcon />
                </IconButton>
                <IconButton onClick={handleSelectMessage}>
                    <CheckCircleOutlineIcon />
                </IconButton>
            </Popper>
        </Box>
    );
};

export default MessageRevoked;
