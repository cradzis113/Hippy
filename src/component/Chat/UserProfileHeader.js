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
import {
    Search as SearchIcon,
    Call as CallIcon,
    MoreVert as MoreVertIcon,
    Close as CloseIcon,
    PushPinOutlined as PushPinOutlinedIcon
} from '@mui/icons-material';
import useDebounce from '../../utils/debounce';
import VerticalCarousel from './VerticalCarousel';
import useSettingStore from '../../stores/settingStore';
import authStore from '../../stores/authStore';
import useSocketStore from '../../stores/socketStore';
import useDataStore from '../../stores/dataStore';

const UserProfileHeader = ({ user }) => {
    const socket = useSocketStore(state => state.socket)
    const userData = authStore(state => state.userData)
    const carouselSlides = useDataStore(state => state.carouselSlides);
    const setPinnedViewActive = useSettingStore(state => state.setPinnedViewActive);
    const userName = authStore(state => state.userName);

    const currentUser = userName;
    const searchInputRef = useRef(null);
    const [searchState, setSearchState] = useState({
        query: '',
        results: [],
        isActive: false,
        isResultsVisible: false
    });
    const [userStatus, setUserStatus] = useState(null)

    const handleSearch = React.useCallback((searchTerm) => {
        if (searchTerm.trim() === '') {
            return setSearchState(prev => ({ ...prev, results: [] }));
        }

        const messageHistoryForUser = user.messageHistory[currentUser];
        const filteredMessages = messageHistoryForUser.filter(
            message => message.message.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSearchState(prev => ({
            ...prev,
            results: filteredMessages.length === 0 ? 'empty' : filteredMessages,
            isResultsVisible: true
        }));
    }, [user, userData]);

    const [debouncedSearch, loading] = useDebounce(handleSearch, 500);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchState(prev => ({ ...prev, query: value }));
        debouncedSearch(value);
    };

    const handleClose = () => {
        setSearchState(prev => ({
            ...prev,
            query: '',
            results: [],
            isActive: prev.query ? true : false
        }));
    };

    const truncateText = (text, maxLength = 20) => {
        if (text.length <= maxLength) return text;
        const start = text.slice(0, 10);
        const end = text.slice(-7);
        return `${start}...${end}`;
    };

    useEffect(() => {
        if (!socket || !user) return;
        const handleUserStatusUpdate = (data) => {
            setUserStatus(data)
        };

        socket.on('chatUserStatus', handleUserStatusUpdate);
        return () => socket.off('chatUserStatus', handleUserStatusUpdate);
    }, [socket, user]);

    const getStatusMessage = () => {
        if (!userStatus) return user.lastSeenMessage;
        return userStatus.userName === user.userName && userStatus.status === 'online'
            ? userStatus.status
            : user.lastSeenMessage;
    }

    return (
        <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, position: 'relative' }}>
                    <Avatar
                        src="https://via.placeholder.com/40"
                        alt="User avatar"
                        sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    {!searchState.isActive ? (
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="black" lineHeight={1.2}>
                                {user.userName}
                            </Typography>
                            <Typography
                                variant="body2"
                                color={userStatus?.userName === user.userName && userStatus?.status === 'online' ? 'primary' : 'textSecondary'}
                                fontWeight={500}
                            >
                                {getStatusMessage()}
                            </Typography>
                        </Box>
                    ) : (
                        <ClickAwayListener
                            onClickAway={(event) => {
                                if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                                    setSearchState(prev => ({ ...prev, isResultsVisible: false }));
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
                                    value={searchState.query}
                                    onChange={handleInputChange}
                                    onFocus={() => setSearchState(prev => ({ ...prev, isResultsVisible: true }))}
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
                                    {searchState.results === 'empty' && (
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
                                                There were no results for "{truncateText(searchState.query)}". Try a new search.
                                            </Typography>
                                        </>
                                    )}
                                    {searchState.results !== 'empty' && searchState.results.length > 0 && searchState.isResultsVisible && (
                                        <>
                                            <Divider />
                                            <List>
                                                {searchState.results.map((message) => (
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
                {!searchState.isActive && (
                    <>
                        {Boolean(userData?.data?.user?.pinnedInfo?.[user?.userName] && user?.pinnedInfo?.[currentUser]) ? (
                            userData?.data?.user?.pinnedInfo?.[user?.userName] && user?.pinnedInfo?.[currentUser] && <VerticalCarousel />
                        ) : (
                            carouselSlides.length > 0 &&
                            (carouselSlides[0].recipientUserName === user?.userName || carouselSlides[0].recipientUserName === currentUser) &&
                            (carouselSlides[0].senderUserName === user?.userName || carouselSlides[0].senderUserName === currentUser) &&
                            <VerticalCarousel />
                        )}
                        {Boolean(userData?.data?.user?.pinnedInfo?.[user?.userName] && user?.pinnedInfo?.[currentUser]) ? (
                            userData?.data?.user?.pinnedInfo?.[user?.userName] && user?.pinnedInfo?.[currentUser] &&
                            carouselSlides?.filter(slide => !slide.revoked?.revokedBy?.includes(userName) && !slide.revoked?.revokedBoth)?.length > 1 &&
                            <IconButton onClick={() => setPinnedViewActive(true)}>
                                <PushPinOutlinedIcon />
                            </IconButton>
                        ) : (
                            carouselSlides?.filter(slide => !slide.revoked?.revokedBy?.includes(userName) && !slide.revoked?.revokedBoth)?.length > 1 &&
                            (carouselSlides[0].recipientUserName === user?.userName || carouselSlides[0].recipientUserName === currentUser) &&
                            (carouselSlides[0].senderUserName === user?.userName || carouselSlides[0].senderUserName === currentUser) &&
                            <IconButton onClick={() => setPinnedViewActive(true)}>
                                <PushPinOutlinedIcon />
                            </IconButton>
                        )}
                        <IconButton onClick={() => setSearchState(prev => ({ ...prev, isActive: true }))}>
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

export default UserProfileHeader;
