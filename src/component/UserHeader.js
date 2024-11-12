import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, TextField, Divider, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, ClickAwayListener } from '@mui/material';
import { useSocket } from '../context/SocketContext';
import SearchIcon from '@mui/icons-material/Search';
import CallIcon from '@mui/icons-material/Call';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import useDebounce from '../utils/debounce';
import { useAuth } from '../context/AuthContext';

const UserHeader = ({ user }) => {
    const socket = useSocket();
    const { userData } = useAuth();

    const [searchText, setSearchText] = useState('');
    const [userStatus, setUserStatus] = useState({});
    const [searchResult, setSearchResult] = useState([]);
    const [searchState, setSearchState] = useState(false);
    const [resultState, setResultState] = useState(false)
    const [debouncedSearch, loading] = useDebounce((value) => handleSearch(value), 500);

    useEffect(() => {
        if (user) {
            setUserStatus(user);
        }

        const handleUserStatusUpdate = (data) => {
            if (data.userName === user.userName) {
                setUserStatus(data);
            }
        };

        if (socket) {
            socket.current.on('userStatusUpdated', handleUserStatusUpdate);
            return () => {
                socket.current.off('userStatusUpdated', handleUserStatusUpdate);
            };
        }
    }, [socket, user]);

    const handleSearch = (searchTerm) => {
        const currentUser = userData?.data?.user?.userName;
        const messageHistoryForUser = user.messageHistory[currentUser];
        const filteredMessages = messageHistoryForUser.filter(i => i.message.includes(searchTerm));

        setResultState(true)
        setSearchResult(filteredMessages);
    };

    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchText(value);
        debouncedSearch(value);
    };

    const handleClose = () => {
        if (searchText) {
            setSearchText('');  // Xóa nội dung của TextField
        } else {
            setSearchState(false);  // Đóng lại chế độ tìm kiếm
        }
    };

    return (
        <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper', top: 0 }}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, position: 'relative' }}>
                    <Avatar
                        src="https://via.placeholder.com/40"
                        alt="User avatar"
                        sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    {!searchState ? (
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="black" lineHeight={1.2}>
                                {userStatus.userName}
                            </Typography>
                            <Typography
                                variant="body2"
                                color={userStatus.status === 'online' ? 'primary' : 'textSecondary'}
                                fontWeight={500}
                            >
                                {userStatus.status === 'online' ? userStatus.status : userStatus.lastSeenMessage}
                            </Typography>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                zIndex: 10,
                                right: 0,
                                bgcolor: 'white',
                                overflow: 'hidden',
                                borderRadius: '12px',
                                width: 'calc(100% - 55px)',
                            }}
                        >
                            <TextField
                                fullWidth
                                autoFocus
                                variant="outlined"
                                autoComplete="off"
                                value={searchText}
                                onChange={handleInputChange}
                                sx={{
                                    backgroundColor: 'blue',
                                    borderTopLeftRadius: '12px',
                                    borderTopRightRadius: '12px',
                                    '& .MuiOutlinedInput-root': {
                                        padding: '2px 6px',
                                        '& input': {
                                            padding: '4px',
                                        },
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <IconButton>
                                                {loading ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <SearchIcon />
                                                )}
                                            </IconButton>
                                        ),
                                        endAdornment: (
                                            <IconButton onClick={handleClose}>
                                                <CloseIcon />
                                            </IconButton>
                                        ),
                                    },
                                }}
                            />
                            <Box
                                sx={{
                                    px: 2,
                                    maxHeight: 400,
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#888',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            backgroundColor: '#555',
                                        },
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: '#f1f1f1',
                                        borderRadius: '4px',
                                    },
                                }}
                            >
                                <ClickAwayListener onClickAway={() => setResultState(!resultState)}>
                                    <Box>
                                        {searchResult.length > 0 && resultState && (
                                            <>
                                                <Divider sx={{ pt: 1 }} />
                                                <List>
                                                    {searchResult.map((message) => (
                                                        <ListItem
                                                            disablePadding
                                                            key={message.id}
                                                            alignItems="flex-start"
                                                            sx={{
                                                                px: 1,
                                                                borderRadius: '12px',
                                                                '&:hover': {
                                                                    backgroundColor: '#f5f5f5',
                                                                },
                                                            }}
                                                            secondaryAction={
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {message.time}
                                                                </Typography>
                                                            }
                                                        >
                                                            <ListItemAvatar>
                                                                <Avatar src={message.avatar} alt={`${message.userName} avatar`} />
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                disableTypography
                                                                primary={
                                                                    <Typography variant="body1" fontWeight="bold" color="black">
                                                                        {message.senderUserName}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Typography
                                                                        variant="body2"
                                                                        component="span"
                                                                        sx={{
                                                                            color: "gray",
                                                                            display: 'block',
                                                                            lineHeight: 1.4,
                                                                        }}
                                                                    >
                                                                        {message.message}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </>
                                        )}
                                    </Box>
                                </ClickAwayListener>
                            </Box>
                        </Box>
                    )}
                </Box>
                {!searchState && (
                    <>
                        <IconButton onClick={() => setSearchState(true)}>
                            <SearchIcon />
                        </IconButton>
                        <IconButton>
                            <CallIcon />
                        </IconButton>
                        <IconButton>
                            <MoreVertIcon />
                        </IconButton>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );

};

export default UserHeader;
