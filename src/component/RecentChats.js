import React, { forwardRef, useRef } from 'react';
import { Tabs, Tab, Box, Avatar, Typography, useMediaQuery, Divider } from '@mui/material';
import { useData } from '../context/DataContext';

const tabLabels = ['Chats', 'Teen Chat', 'Channels', 'Apps', 'Media'];

const RecentChats = forwardRef((props, ref) => {
    const [value, setValue] = React.useState(0);
    const containerRef = useRef(null);
    const isDesktop = useMediaQuery('(min-width: 926px)');
    const { searchResult, setCurrentChatUser } = useData();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    const handleClick = (user) => {
        setCurrentChatUser(user)
    }

    const handleWheel = (event) => {
        if (containerRef.current) {
            const scrollSpeed = 0.5;
            containerRef.current.scrollLeft += event.deltaY * scrollSpeed;
        }
    };

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

export default RecentChats;
