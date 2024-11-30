import React from 'react';
import UserMenuToggle from './UserMenuToggle'; 
import ChatSearch from './ChatSearch';
import { Box } from '@mui/material';

const ChatHeader = () => {
    return (
        <Box sx={{ display: 'flex', width: '100%', pr: 2, gap: 1 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserMenuToggle />
            </Box>
            <Box sx={{ flex: 8, display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <ChatSearch />
            </Box>
        </Box>
    );
};

export default ChatHeader;
