import React, { useState } from 'react';
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
import {
    ReplyOutlined as ReplyOutlinedIcon,
    MoreVert as MoreVertIcon,
    PushPin as PushPinIcon,
    DeleteOutline as DeleteOutlineIcon,
    Forward as ForwardIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    SentimentSatisfiedAltOutlined as SentimentSatisfiedAltOutlinedIcon
} from '@mui/icons-material';
import MessageRecallDialog from './MessageRecallDialog';
import useSettingStore from '../../stores/settingStore';
import useSocketStore from '../../stores/socketStore';
import useDataStore from '../../stores/dataStore';
import Picker from 'emoji-picker-react';

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
    openEmojiPicker,
    setOpenEmojiPicker,
}) => {
    const [emojiPlacement, setEmojiPlacement] = useState('bottom');
    const socket = useSocketStore(state => state.socket)
    const setActiveSelectedMessage = useSettingStore(state => state.setActiveSelectedMessage);
    const carouselSlides = useDataStore(state => state.carouselSlides);
    const setSelectedMessages = useDataStore(state => state.setSelectedMessages);
    const currentChatUser = useDataStore(state => state.currentChatUser);
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
        if (carouselSlides.some(slide => slide.id === item.id)) {
            socket.emit('pinMessage', { ...item, currentChatUser: currentChatUser.userName }, 'unpin');
        } else {
            socket.emit('pinMessage', { ...item, currentChatUser: currentChatUser.userName }, 'pin');
        }

        handlePopoverClose();
    };

    const handleSelectMessage = () => {
        handlePopoverClose();
        setActiveSelectedMessage(true);
        setSelectedMessages(prev => [...prev, item]);
    };

    const handleEmojiClick = (emojiData) => {
        socket.emit('reaction', {
            messageId: item.id,
            emoji: emojiData.emoji,
            currentChatUser: currentChatUser.userName,
            currentUser: currentUser,
            type: 'add'
        });
        handlePopoverClose();
    };

    const handleEmojiPickerOpen = (event) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - buttonRect.bottom;

        const newPlacement = spaceBelow <= 400 ? 'top' : 'bottom';
        setEmojiPlacement(newPlacement);
        setOpenEmojiPicker(event.currentTarget);
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
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Trả lời" placement="top">
                        <IconButton onClick={() => handleReply(item)}>
                            <ReplyOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Trả lời" placement="top">
                        <IconButton onClick={handleEmojiPickerOpen}>
                            <SentimentSatisfiedAltOutlinedIcon />
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
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handlePinMessage}>
                                    <ListItemIcon sx={{ minWidth: 45 }}>
                                        <PushPinIcon />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body1">{carouselSlides.some(slide => slide.id === item.id) ? 'bỏ ghim' : 'Ghim'}</Typography>
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
            <Popper
                open={Boolean(openEmojiPicker)}
                anchorEl={openEmojiPicker}
                placement={emojiPlacement}
            >
                <Picker
                    reactionsDefaultOpen={true}
                    onEmojiClick={handleEmojiClick}
                />
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
