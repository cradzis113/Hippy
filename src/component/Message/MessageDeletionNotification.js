import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const MessageDeletionNotification = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        py: 2,
        px: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        border: '1px solid',
        borderColor: 'divider',
        maxWidth: '300px',
        mx: 'auto',
      }}
    >
      <Divider sx={{ width: '100%', mb: 1 }} />
      <Typography variant="body2" color="text.secondary" fontWeight={'bold'}>
        History was cleared
      </Typography>
      <Divider sx={{ width: '100%', mt: 1 }} />
    </Box>
  );
};

export default MessageDeletionNotification;
