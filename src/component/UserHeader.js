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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CallIcon from '@mui/icons-material/Call';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import useDebounce from '../utils/debounce';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';
import VerticalCarousel from './VerticalCarousel';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

const UserHeader = ({ user }) => {
    const socket = useSocket();
    const { userData } = useAuth();
    const { carouselSlides } = useData()

    const searchInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserStatus, setCurrentUserStatus] = useState({});

    const [searchResults, setSearchResults] = useState([]);

    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isSearchResultsVisible, setIsSearchResultsVisible] = useState(false);

    const [debouncedSearch, loading] = useDebounce((value) => handleSearch(value), 500);

    const handleSearch = (searchTerm) => {
        if (searchTerm.trim() === '') {
            return setSearchResults([]);
        }

        const currentUser = userData?.data?.user?.userName;
        const messageHistoryForUser = user.messageHistory[currentUser];
        const filteredMessages = messageHistoryForUser.filter((message) => message.message.includes(searchTerm));
        setIsSearchResultsVisible(true);

        if (filteredMessages.length === 0) {
            return setSearchResults('empty');
        }

        setSearchResults(filteredMessages);
    };

    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    const handleClose = () => {
        if (searchQuery) {
            setSearchQuery('');
            setSearchResults([]);
        } else {
            setIsSearchActive(false);
        }
    };

    const truncateText = (text, maxLength = 20) => {
        if (text.length <= maxLength) return text;
        const start = text.slice(0, 10);
        const end = text.slice(-7);
        return `${start}...${end}`;
    };

    useEffect(() => {
        if (user) {
            setCurrentUserStatus(user);
        }

        const handleUserStatusUpdate = (data) => {
            if (data.userName === user.userName) {
                setCurrentUserStatus(data);
            }
        };

        if (socket) {

            socket.current.on('userStatusUpdated', handleUserStatusUpdate);
            return () => {
                socket.current.off('userStatusUpdated', handleUserStatusUpdate);
            };
        }
    }, [socket, user]);

    return (
        <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, position: 'relative' }}>
                    <Avatar
                        src="https://via.placeholder.com/40"
                        alt="User avatar"
                        sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    {!isSearchActive ? (
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="black" lineHeight={1.2}>
                                {currentUserStatus.userName}
                            </Typography>
                            <Typography
                                variant="body2"
                                color={currentUserStatus.status === 'online' ? 'primary' : 'textSecondary'}
                                fontWeight={500}
                            >
                                {currentUserStatus.status === 'online' ? currentUserStatus.status : currentUserStatus.lastSeenMessage}
                            </Typography>
                        </Box>
                    ) : (
                        <ClickAwayListener
                            onClickAway={(event) => {
                                if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                                    setIsSearchResultsVisible(false);
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
                                    ref={searchInputRef}
                                    fullWidth
                                    autoFocus
                                    variant="outlined"
                                    autoComplete="off"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    onFocus={() => setIsSearchResultsVisible(true)}
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
                                    {searchResults === 'empty' && (
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
                                                There were no results for "{truncateText(searchQuery)}". Try a new search.
                                            </Typography>
                                        </>
                                    )}
                                    {searchResults !== 'empty' && searchResults.length > 0 && isSearchResultsVisible && (
                                        <>
                                            <Divider />
                                            <List>
                                                {searchResults.map((message) => (
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
                {!isSearchActive && (
                    <>
                        {carouselSlides?.length > 0 && <VerticalCarousel slides={carouselSlides} />}
                        {carouselSlides?.length > 1 && (
                            <IconButton>
                                <PushPinOutlinedIcon />
                            </IconButton>
                        )}
                        <IconButton onClick={() => setIsSearchActive(true)}>
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
