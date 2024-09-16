import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CallIcon from '@mui/icons-material/Call';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSocket } from '../context/SocketContext';

const UserHeader = ({ user }) => {
    const socket = useSocket()
    const [userStatus, setUserStatus] = useState({})

    useEffect(() => {
        if (user) {
            setUserStatus(user)
        }

        if (socket) {
            const handleUserStatusUpdate = (data) => {
                if (data.userName === user.userName) {
                    setUserStatus(data)
                }
            };

            socket.on('userStatusUpdated', handleUserStatusUpdate);

            return () => {
                socket.off('userStatusUpdated', handleUserStatusUpdate);
            };
        }
    }, [socket, user]);

    return (
        <AppBar
            position="static"
            elevation={1}
            sx={{ backgroundColor: 'background.paper' }}
        >
            <Toolbar>
                <Box display="flex" alignItems="center" flexGrow={1}>
                    <Avatar
                        src="https://via.placeholder.com/40" // Replace with actual avatar URL
                        alt="User avatar"
                        sx={{ width: 40, height: 40, mr: 2 }}
                    >

                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color='black' lineHeight={1.2}>
                            {userStatus.userName}
                        </Typography>
                        <Typography variant="body2" color={userStatus.status === 'online' ? 'primary' : "textSecondary"} fontWeight={500}>
                            {userStatus.status === 'online' ? userStatus.status : userStatus.lastSeen}
                        </Typography>
                    </Box>
                </Box>
                <IconButton>
                    <SearchIcon />
                </IconButton>
                <IconButton>
                    <CallIcon />
                </IconButton>
                <IconButton>
                    <MoreVertIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default UserHeader;
