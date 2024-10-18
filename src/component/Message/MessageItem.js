import React, { useState } from 'react';
import { Box } from '@mui/material';
import { green } from '@mui/material/colors';
import RevokeMessage from './RevokeMessage';
import MessageContent from './MessageContent';
import MessageActions from './MessageActions';
import { useSocket } from '../../context/SocketContext';

const MessageItem = ({
    item,
    currentUser,
    setUserReplied,
    setMessageReplied
}) => {
    const socket = useSocket()

    const [dialogState, setDialogState] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const [currentAnchorEl, setCurrentAnchorEl] = useState(null);
    const [dotAnchor, setDotAnchor] = useState(null);

    const handleOpenDialog = () => {
        setDialogState(true);
    };

    const handleCloseDialog = () => {
        setDialogState(false);
    };

    const handlePopoverOpen = (element, index) => {
        setAnchorEl(index);
        setCurrentAnchorEl(element);
    };

    const handleRetrieveMessages = (data) => {
        const newData = { ...data, currentUser };
        socket.current.emit('deleteMessage', newData);
        handlePopoverClose();
    };

    const handleReply = (replyData) => {
        setUserReplied(replyData.senderUserName);
        setMessageReplied(replyData.message);
    };

    const handleDotAnchor = (event) => {
        setDotAnchor(event.currentTarget);
    };

    const handlePopoverClose = () => {
        handleCloseDialog();
        setAnchorEl(null);
        setDotAnchor(null)
        setCurrentAnchorEl(null);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const [datePart, timePart] = timestamp.split(' ');
        if (!timePart) return '';
        const [hours, minutes] = timePart.split(':');
        return `${hours}:${minutes}`;
    };

    if (item?.revoked?.revokedBoth) {
        return (
            <RevokeMessage
                item={item}
                anchorEl={anchorEl}
                currentUser={currentUser}
                formatTime={formatTime}
                currentAnchorEl={currentAnchorEl}
                handlePopoverOpen={handlePopoverOpen}
                handlePopoverClose={handlePopoverClose}
                handleRetrieveMessages={handleRetrieveMessages}
            />
        );
    }

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
            <MessageContent item={item} currentUser={currentUser} />
            <MessageActions
                item={item}
                anchorEl={anchorEl}
                dotAnchor={dotAnchor}
                handleReply={handleReply}
                handleClick={handleDotAnchor}
                currentAnchorEl={currentAnchorEl}
                handlePopoverOpen={handlePopoverOpen}
                handlePopoverClose={handlePopoverClose}
                handleRetrieveMessages={handleRetrieveMessages}
                handleCloseDialog={handleCloseDialog}
                handleOpenDialog={handleOpenDialog}
                dialogState={dialogState}
            />
        </Box>
    );
};

export default MessageItem;
