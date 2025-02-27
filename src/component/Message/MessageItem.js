import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import MessageRevoked from './MessageRevoked';
import MessageContent from './MessageContent';
import MessageActions from './MessageActions';
import useSocketStore from '../../stores/socketStore';
import useSettingStore from '../../stores/settingStore';
import _ from 'lodash';
import MessageReactionDialog from './MessageReactionDialog';

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
    const [openEmojiPicker, setOpenEmojiPicker] = useState(null);
    const activeSelectedMessage = useSettingStore(state => state.activeSelectedMessage);
    const [openReactionDialog, setOpenReactionDialog] = useState(false);

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
        setOpenEmojiPicker(null);
        setPopoverAnchorEl(null);
        setOpenReactionDialog(false);
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
                minWidth: !_.isEmpty(item.reactions) && item.message?.length <= 8 ? '55px' : 'unset',
                position: 'relative',
                mb: !_.isEmpty(item.reactions) ? 2.5 : 0,
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
                    openEmojiPicker={openEmojiPicker}
                    setOpenEmojiPicker={setOpenEmojiPicker}
                />
            )}
            {!_.isEmpty(item.reactions) && (
                <Box sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '2px 6px',
                    borderRadius: '16px',
                    position: 'absolute',
                    bottom: -15,
                    right: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    zIndex: 1,
                    fontSize: '13px'
                }}>
                    {_.chain(item.reactions)
                        .groupBy((value, key) => value)
                        .map((reaction, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                gap: '4px'
                            }}
                                onClick={() => {
                                    setOpenReactionDialog(true)
                                }}
                            >
                                <span role="img" aria-label="reaction">{index}</span>
                                {reaction.length > 1 && (
                                    <Typography component="span" sx={{ fontSize: 'inherit', mt: '1px' }}>
                                        {reaction.length}
                                    </Typography>
                                )}
                            </Box>
                        ))
                        .value()}
                    <MessageReactionDialog
                        open={openReactionDialog}
                        onClose={() => setOpenReactionDialog(false)}
                        reactionData={item}
                        currentUserId={currentUser}
                        handlePopoverClose={handlePopoverClose}
                    />
                </Box>
            )}
        </Box>
    );
};

export default MessageItem;
