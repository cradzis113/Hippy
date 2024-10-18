import React, { useState } from 'react';
import {
    Box, IconButton, Popper, Tooltip, Popover, List, ListItem, ListItemButton, Typography,
    Dialog, DialogActions, DialogContentText, DialogContent, DialogTitle, Button
} from '@mui/material';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MessageRecallDialog from './MessageRecallDialog'; // Assuming you have the recall dialog as a separate component

const MessageActions = ({
    item,
    anchorEl,
    dotAnchor,
    handleReply,
    handleClick,
    currentAnchorEl,
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

    const handleRecall = (recallOption) => {
        console.log(`Message recalled with option: ${recallOption}`);
        handleRetrieveMessages(item); // Call this or your custom logic
    };

    return (
        <>
            <Popper
                open={anchorEl === item.id}
                anchorEl={currentAnchorEl}
                placement="right"
                disablePortal={true}
                onMouseEnter={() => handlePopoverOpen(currentAnchorEl, item.id)}
            >
                <Box>
                    <Tooltip title="Trả lời" placement="top">
                        <IconButton onClick={() => handleReply(item)}>
                            <ReplyOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xem thêm" placement="top">
                        <IconButton onClick={handleClick}>
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
                                <ListItemButton onClick={handleOpenDialog}>
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
