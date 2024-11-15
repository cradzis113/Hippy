import React, { useEffect, useState, useRef } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
    TextField,
    Divider,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ClickAwayListener,
    Paper,
} from '@mui/material';
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
    const inputRef = useRef(null);

    const [searchText, setSearchText] = useState('');
    const [userStatus, setUserStatus] = useState({});
    const [searchResult, setSearchResult] = useState([]);
    const [searchState, setSearchState] = useState(false);
    const [resultState, setResultState] = useState(false);
    const [debouncedSearch, loading] = useDebounce((value) => handleSearch(value), 500);

    useEffect(() => {
        if (user) {
            setUserStatus(user);
            console.log(user)
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
        if (searchTerm.trim() === '') {
            return setSearchResult([])
        }

        const currentUser = userData?.data?.user?.userName;
        const messageHistoryForUser = user.messageHistory[currentUser];
        const filteredMessages = messageHistoryForUser.filter((i) => i.message.includes(searchTerm));
        setResultState(true);

        if (filteredMessages.length === 0) {
            return setSearchResult('empty')
        }

        setSearchResult(filteredMessages);
    };

    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchText(value);
        debouncedSearch(value);
    };

    const handleClose = () => {
        if (searchText) {
            setSearchText('');
            setSearchResult([])
        } else {
            setSearchState(false);
        }
    };

    const truncateText = (text, maxLength = 20) => {
        if (text.length <= maxLength) return text;
        const start = text.slice(0, 10);
        const end = text.slice(-7);
        return `${start}...${end}`;
    };

    return (
        <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
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
                        <ClickAwayListener
                            onClickAway={(event) => {
                                if (inputRef.current && !inputRef.current.contains(event.target)) {
                                    setResultState(false);
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -2,
                                    zIndex: 10,
                                    right: 0,
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    width: 'calc(100% - 55px)',
                                    background: 'white',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                <TextField
                                    ref={inputRef}
                                    fullWidth
                                    autoFocus
                                    variant="outlined"
                                    autoComplete="off"
                                    value={searchText}
                                    onChange={handleInputChange}
                                    onFocus={() => setResultState(true)}
                                    sx={{
                                        borderTopLeftRadius: '12px',
                                        borderTopRightRadius: '12px',
                                        '& .MuiOutlinedInput-root': {
                                            padding: '2px 6px',
                                            '& input': {
                                                backgroundColor: '#dfe1e',
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
                                                    {loading ? <CircularProgress size={20} /> : <SearchIcon />}
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
                                    {searchResult === 'empty' && (
                                        <>
                                            <Divider />
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: 'gray',
                                                    textAlign: 'center',
                                                    my: 0.5,
                                                }}
                                            >
                                                There were no results for "{truncateText(searchText)}". Try a new search.
                                            </Typography>
                                        </>
                                    )}
                                    {searchResult !== 'empty' && searchResult.length > 0 && resultState && (
                                        <>
                                            <Divider />
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
                                                                        color: 'gray',
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
                            </Box>
                        </ClickAwayListener>
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
        </AppBar >
    );
};

export default UserHeader;
