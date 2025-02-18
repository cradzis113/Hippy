import React, { useState } from 'react';
import { Box } from '@mui/material';
import { green } from '@mui/material/colors';
import MessageRevoked from './MessageRevoked';
import MessageContent from './MessageContent';
import MessageActions from './MessageActions';
import useSocketStore from '../../stores/socketStore';
import useSettingStore from '../../stores/settingStore';

const MessageItem = ({
    item,
    currentUser,
    setUserReplied,
    setMessageReplied
}) => {
    const socket = useSocketStore(state => state.socket)
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const [currentPopoverAnchorEl, setCurrentPopoverAnchorEl] = useState(null);
    const [dotAnchor, setDotAnchor] = useState(null);
    const activeSelectedMessage = useSettingStore(state => state.activeSelectedMessage);

    const handlePopoverOpen = (element, index) => {
        setPopoverAnchorEl(index);
        setCurrentPopoverAnchorEl(element);
    };

    const handleRetrieveMessages = (messageData, visibilityOption) => {
        const updatedData = { ...messageData, currentUser, visibilityOption };
        socket.emit('deleteMessage', updatedData);
        handlePopoverClose();
    };

    const handleReply = (replyData) => {
        setUserReplied(replyData.senderUserName);
        setMessageReplied(replyData.message);
    };

    const handleActionMenuOpen = (event) => {
        setDotAnchor(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setDotAnchor(null);
        setPopoverAnchorEl(null);
        setCurrentPopoverAnchorEl(null);
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
            <MessageRevoked
                item={item}
                formatTime={formatTime}
                currentUser={currentUser}
                anchorEl={popoverAnchorEl}
                handlePopoverOpen={handlePopoverOpen}
                handlePopoverClose={handlePopoverClose}
                currentAnchorEl={currentPopoverAnchorEl}
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
            <MessageContent item={item} currentUser={currentUser} formatTime={formatTime} />
            {!activeSelectedMessage && (
                <MessageActions
                    item={item}
                    dotAnchor={dotAnchor}
                    handleReply={handleReply}
                    currentUser={currentUser}
                    popoverAnchorEl={popoverAnchorEl}
                    handleDotAnchor={handleActionMenuOpen}
                    handlePopoverOpen={handlePopoverOpen}
                    handlePopoverClose={handlePopoverClose}
                    currentPopoverAnchorEl={currentPopoverAnchorEl}
                    handleRetrieveMessages={handleRetrieveMessages}
                />
            )}
        </Box>
    );
};

export default MessageItem;
