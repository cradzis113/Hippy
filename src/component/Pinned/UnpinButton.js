import React from 'react';
import { Button, Box } from '@mui/material';

const UnpinButton = ({ onClick }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        variant="contained"
        onClick={onClick}
        sx={{
          backgroundColor: 'white',
          color: 'black',
          fontWeight: 'bold',
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          padding: '8px 16px',
          maxWidth: '200px', // Limit the maximum width
          width: '100%', // Responsive scaling
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        Unpin All Messages
      </Button>
    </Box>
  );
};

export default UnpinButton;
