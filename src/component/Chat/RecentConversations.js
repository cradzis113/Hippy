import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Tabs, Tab, Box, Avatar, Typography, useMediaQuery, Divider } from '@mui/material';
import { useData } from '../../context/DataContext';
import { useSetting } from '../../context/SettingContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const tabLabels = ['Chats', 'Teen Chat', 'Channels', 'Channels', 'Apps', 'Media'];

const RecentConversations = forwardRef((props, ref) => {
    const containerRef = useRef(null);
    const [value, setValue] = useState(0);

    const socket = useSocket();
    const { userData } = useAuth();
    const { setBackState } = useSetting();

    const userName = userData.data.user.userName;
    const { searchResult, setCurrentChatUser, setMessageBackState, } = useData();

    const isDesktop = useMediaQuery('(min-width: 926px)');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const handleClick = (user) => {
        setBackState(false);
        setCurrentChatUser(user);

        if (socket?.current) {
            const chatEventData = {
                recipientUserName: user.userName,
                recipientSocketId: user.socketId,
                userName: userName,
                socketId: socket.current.id,
                type: 'chatRequest'
            };
            
            socket.current.emit('chatEvent', chatEventData);
            socket.current.emit('updateBackState', { backState: false,  userName });
        }
    };

    const handleWheel = React.useCallback((event) => {
        if (containerRef.current) {
            const scrollSpeed = 0.5;
            containerRef.current.scrollLeft += event.deltaY * scrollSpeed;
        }
    }, []);

    useEffect(() => {
        if (socket.current) {
            socket.current.on('messageBackState', (updatedMessages, user) => setMessageBackState(prev => ({
                messages: [...prev.messages, updatedMessages],
                user: user
            })));
            return () => socket.current.off('messageBackState');
        }
    }, [socket.current]);

    const UserAvatar = ({ user }) => (
        <Avatar
            src={user.image}
            sx={{
                width: 56,
                height: 56,
                backgroundColor: !user.image ? 'pink' : 'transparent',
            }}
        >
            {!user.image && user.userName[0]}
        </Avatar>
    );

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }} {...props} ref={ref}>
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons={isDesktop ? 'auto' : false}
                allowScrollButtonsMobile
            >
                {tabLabels.map((label, index) => (
                    <Tab
                        key={index}
                        label={
                            <Typography variant='body2' sx={{ textTransform: 'none', fontWeight: '600' }}>{label}</Typography>
                        }
                    />
                ))}
            </Tabs>
            <Divider sx={{ mt: 0.1 }} />
            <Box
                ref={containerRef}
                onWheel={handleWheel}
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    marginTop: 1,
                    p: '8px 2px 2px 2px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
            >
                {searchResult?.map((user, index) => (
                    <Box
                        key={index}
                        sx={{
                            marginX: 2,
                            p: 1,
                            borderRadius: 2,
                            userSelect: 'none',
                            transition: 'background-color 0.3s ease-in-out',
                            '&:hover': {
                                cursor: 'pointer',
                                bgcolor: '#e0e0e0'
                            },
                        }}
                        onClick={() => handleClick(user)}
                    >
                        <UserAvatar user={user} />
                        <Typography
                            variant="caption"
                            sx={{
                                mt: 1,
                                display: 'block',
                                overflow: 'hidden',
                                textAlign: 'center',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '60px',
                            }}
                        >
                            {user.userName}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
});

export default React.memo(RecentConversations);
