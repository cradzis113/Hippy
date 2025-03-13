import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Box,
  ButtonBase,
} from '@mui/material';
import {
  Close as CloseIcon,
  SwapHorizOutlined as SwapHorizOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon
} from '@mui/icons-material';
import MessageRecallDialog from './MessageRecallDialog';
import useSocketStore from '../../stores/socketStore';
import useSettingStore from '../../stores/settingStore';
import useDataStore from '../../stores/dataStore';

const MessageSelectionBar = ({
  selectedCount,
  onForward,
  item,
  currentUser
}) => {
  const socket = useSocketStore(state => state.socket)
  const setSelectedMessages = useDataStore(state => state.setSelectedMessages);
  const setActiveSelectedMessage = useSettingStore(state => state.setActiveSelectedMessage);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRetrieveMessages = (messageData, visibilityOption) => {
    let updatedData = {};

    const otherUserMessages = messageData.filter(msg => msg.senderUserName !== currentUser);
    const currentUserMessages = messageData.filter(msg => msg.senderUserName === currentUser && !msg.revoked);
    const currentUserRevokedMessages = messageData.filter(msg => msg.senderUserName === currentUser && msg.revoked);

    if ((currentUserMessages.length === 0 || currentUserRevokedMessages.length === 0) && otherUserMessages.length === 0) {
      updatedData = { messageData, currentUser, visibilityOption };
    } else if (otherUserMessages.length > 0 || currentUserMessages.length > 0 || currentUserRevokedMessages.length > 0) {
      if (visibilityOption === 'everyone') {
        updatedData = {
          ...(otherUserMessages.length > 0 && {
            otherUsers: { visibilityOption: 'onlyYou', messages: otherUserMessages }
          }),
          ...(currentUserMessages.length > 0 && {
            currentUserMessages: { visibilityOption: 'everyone', messages: currentUserMessages }
          }),
          ...(currentUserRevokedMessages.length > 0 && {
            currentUserRevokedMessages: { visibilityOption: 'onlyYou', messages: currentUserRevokedMessages }
          }),
          currentUser
        };
      } else if (visibilityOption === 'onlyYou') {
        if (currentUserMessages.length > 0 || otherUserMessages.length > 0 || currentUserRevokedMessages.length > 0) {
          updatedData = {
            ...(otherUserMessages.length > 0 && {
              otherUsers: { visibilityOption: 'onlyYou', messages: otherUserMessages }
            }),
            ...(currentUserMessages.length > 0 && {
              currentUserMessages: { visibilityOption: 'onlyYou', messages: currentUserMessages }
            }),
            ...(currentUserRevokedMessages.length > 0 && {
              currentUserRevokedMessages: { visibilityOption: 'onlyYou', messages: currentUserRevokedMessages }
            }),
            currentUser
          };
        }
      }
    }
    setSelectedMessages([]);
    setActiveSelectedMessage(false);
    socket.emit('messageDelete', updatedData);
  };

  const handleOpenDialog = () => {
    const currentUserMessages = item.filter(msg => msg.senderUserName === currentUser);
    const allMessagesRevoked = currentUserMessages.every(msg => msg.revoked)

    if (currentUserMessages.length === 0 || allMessagesRevoked) {
      handleRetrieveMessages(item, 'onlyYou');
    } else {
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleRecall = (visibilityOption) => {
    handleRetrieveMessages(item, visibilityOption);
  };

  const handleCloseSelection = () => {
    setSelectedMessages([]);
    setActiveSelectedMessage(null);
  };

  return (
    <AppBar
      color="inherit"
      sx={{
        backgroundColor: '#fff',
        zIndex: 1000,
        position: 'static',
        borderRadius: '12px',
        marginBottom: 2,
        maxWidth: '500px',
        margin: '16px auto',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '48px !important',
          padding: '8px 12px !important'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ width: '100%' }}
        >
          <IconButton edge="start" onClick={handleCloseSelection}>
            <CloseIcon />
          </IconButton>

          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            {selectedCount} message{selectedCount > 1 ? 's' : ''}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <ButtonBase
              onClick={onForward}
              sx={{
                borderRadius: 0,
                padding: '8px',
                gap: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <SwapHorizOutlinedIcon />
              <Typography variant='body1'>Chuyển tiếp</Typography>
            </ButtonBase>
            <ButtonBase
              onClick={handleOpenDialog}
              sx={{
                color: 'error.main',
                borderRadius: 0,
                padding: '8px',
                gap: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <DeleteOutlineIcon />
              <Typography variant='body1'>Xóa</Typography>
            </ButtonBase>
          </Box>
        </Stack>
      </Toolbar>
      <MessageRecallDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        handleRecall={handleRecall}
      />
    </AppBar>
  );
};

export default MessageSelectionBar;