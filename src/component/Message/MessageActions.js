import React, { useEffect, useState } from 'react';
import {
    Box,
    IconButton,
    Popper,
    Tooltip,
    Popover,
    List,
    ListItem,
    ListItemButton,
    Typography,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MessageRecallDialog from './MessageRecallDialog';
import { useSocket } from '../../context/SocketContext';
import { useData } from '../../context/DataContext';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ForwardIcon from '@mui/icons-material/Forward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useSetting } from '../../context/SettingContext';

const MessageActions = ({
    item,
    popoverAnchorEl,
    dotAnchor,
    currentUser,
    handleReply,
    handleDotAnchor,
    currentPopoverAnchorEl,
    handlePopoverOpen,
    handlePopoverClose,
    handleRetrieveMessages,
}) => {
    const socket = useSocket();
    const { setActiveSelectedMessage } = useSetting();
    const { carouselSlides, setSelectedMessages } = useData();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleRecall = (visibilityOption) => {
        handleRetrieveMessages(item, visibilityOption);
    };

    const handleRevokeMessage = () => {
        if (currentUser === item.senderUserName) {
            handleOpenDialog();
        } else {
            handleRetrieveMessages(item, 'onlyYou');
        }
    };

    const handlePinMessage = () => {
        if (carouselSlides.some(o => o.message === item.message)) {
            socket.current.emit('pinMessage', item, 'unpin');
        } else {
            socket.current.emit('pinMessage', item, 'pin');
        }

        handlePopoverClose();
    };

    const handleSelectMessage = () => {
        handlePopoverClose();
        setActiveSelectedMessage(true);
        setSelectedMessages(prev => [...prev, item]);
    };

    return (
        <>
            <Popper
                open={popoverAnchorEl === item.id}
                anchorEl={currentPopoverAnchorEl}
                placement="right"
                disablePortal={true}
                onMouseEnter={() => handlePopoverOpen(currentPopoverAnchorEl, item.id)}
            >
                <Box>
                    <Tooltip title="Trả lời" placement="top">
                        <IconButton onClick={() => handleReply(item)}>
                            <ReplyOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xem thêm" placement="top">
                        <IconButton onClick={handleDotAnchor}>
                            <MoreVertIcon />
                        </IconButton>
                    </Tooltip>
                    <Popover
                        open={Boolean(dotAnchor)}
                        anchorEl={dotAnchor}
                        onClose={handlePopoverClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <List >
                            <ListItem disablePadding>
                                <ListItemButton onClick={handlePinMessage}>
                                    <ListItemIcon sx={{ minWidth: 45 }}>
                                        <PushPinIcon />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">{carouselSlides.some(o => o.message === item.message) ? 'bỏ ghim' : 'Ghim'}</Typography>
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleRevokeMessage}>
                                    <ListItemIcon sx={{ minWidth: 45 }}>
                                        <DeleteOutlineIcon />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">Thu hồi</Typography>
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon sx={{ minWidth: 45 }}>
                                        <ForwardIcon />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">Chuyển tiếp</Typography>
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleSelectMessage}>
                                    <ListItemIcon sx={{ minWidth: 45 }}>
                                        <CheckCircleOutlineIcon />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">Lựa chọn</Typography>
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Popover>
                </Box>
            </Popper>
            <MessageRecallDialog
                open={dialogOpen}
                handleClose={handleCloseDialog}
                handleRecall={handleRecall}
            />
        </>
    );
};

export default MessageActions;
