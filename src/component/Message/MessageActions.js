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
} from '@mui/material';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MessageRecallDialog from './MessageRecallDialog';

const MessageActions = ({
    item,
    popoverAnchorEl,
    dotAnchor, // cần được đổi tên thành actionMenuAnchorEl
    currentUser,
    handleReply,
    handleDotAnchor, // cần được đổi tên thành handleActionMenuOpen
    currentPopoverAnchorEl,
    handlePopoverOpen,
    handlePopoverClose,
    handleRetrieveMessages,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleRecall = () => {
        handleRetrieveMessages(item);
    };

    const handleClick = () => {
        if (currentUser === item.senderUserName) {
            handleOpenDialog();
        } else {
            handleRetrieveMessages(item);
        }
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
                        <List sx={{ width: 150 }}>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <Typography variant="body1">Ghim</Typography>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleClick}>
                                    <Typography variant="body1">Thu hồi</Typography>
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <Typography variant="body1">Chuyển tiếp</Typography>
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
