import React, { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import Conversation from './ConversationList';
import RecentChats from './RecentConversations';
import MessageList from '../Message/MessageList';
import { useSetting } from '../../context/SettingContext';
import { Box, Fade } from '@mui/material';
import { green } from '@mui/material/colors';
import { useData } from '../../context/DataContext';
import PinnedMessagesList from '../Pinned/PinnedMessagesList';
import UserProfileHeader from './UserProfileHeader';

const ChatInterface = () => {
    const { backState } = useSetting();
    const { currentChatUser } = useData();
    const { pinnedViewActive } = useSetting();

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Box
                sx={{
                    flex: 2.5,
                    flexBasis: 0,
                    maxWidth: '25%',
                    minWidth: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <ChatHeader />
                {!backState && <Conversation />}
                <Fade in={backState} timeout={{ enter: 300, exit: 0 }}>
                    <RecentChats />
                </Fade>
            </Box>
            <Box
                sx={{
                    flex: 7.5,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: green[50]
                }}
            >
                {Object.keys(currentChatUser).length > 0 && (
                    <>
                        {pinnedViewActive ? <PinnedMessagesList /> : (
                            <>
                                <UserProfileHeader user={currentChatUser} />
                                <MessageList user={currentChatUser} />
                            </>
                        )}

                    </>
                )}
            </Box>
        </Box>
    );
};

export default ChatInterface;
