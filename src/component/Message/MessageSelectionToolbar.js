import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReplyIcon from '@mui/icons-material/Reply';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

const MessageSelectionToolbar = ({ 
  selectedCount, 
  onClose, 
  onReply, 
  onCopy, 
  onDelete 
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
      
      <Typography sx={{ ml: 2, flex: 1 }}>
        {selectedCount} messages selected
      </Typography>

      <IconButton onClick={onReply}>
        <ReplyIcon />
      </IconButton>
      
      <IconButton onClick={onCopy}>
        <ContentCopyIcon />
      </IconButton>
      
      <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default MessageSelectionToolbar; 