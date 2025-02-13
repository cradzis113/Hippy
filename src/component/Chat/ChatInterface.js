import React from 'react';
import ChatHeader from './ChatHeader';
import Conversation from './ConversationList';
import RecentConversations from './RecentConversations';
import MessageList from '../Message/MessageList';

import { Box, Fade } from '@mui/material';
import { green } from '@mui/material/colors';
import useSettingStore from '../../stores/settingStore';

import UserProfileHeader from './UserProfileHeader';
import PinnedMessageItem from '../Pinned/PinnedMessageItem';
import PinnedMessagesHeader from '../Pinned/PinnedMessagesHeader';
import UnpinMessageButton from '../Pinned/UnpinMessageButton';
import _ from 'lodash';
import useDataStore from '../../stores/dataStore';

const ChatInterface = () => {
    const currentChatUser = useDataStore(state => state.currentChatUser);
    const backState = useSettingStore(state => state.backState);
    const pinnedViewActive = useSettingStore(state => state.pinnedViewActive);

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
                    <RecentConversations />
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
                {!_.isEmpty(currentChatUser) > 0 && (
                    <>
                        {pinnedViewActive ? (
                            <>
                                <PinnedMessagesHeader />
                                <PinnedMessageItem />
                                <UnpinMessageButton />

                            </>
                        ) : (
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
