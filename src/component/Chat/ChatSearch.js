import React, { useCallback, useEffect, useState } from 'react';
import { grey, blue } from '@mui/material/colors';
import { Box, TextField, InputAdornment } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import SearchIcon from '@mui/icons-material/Search';
import useDebounce from '../../utils/debounce';
import { useSetting } from '../../context/SettingContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const ChatSearch = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');

    const socket = useSocket();
    const { userData } = useAuth();
    const { setBackState, backState } = useSetting();
    const { setSearchResult } = useData()

    const handleSearch = useCallback((debouncedQuery) => {
        if (socket) {
            socket.current.emit('search', debouncedQuery, (error, results) => {
                if (error) {
                    console.error('Search error:', error);
                } else {
                    const userName = userData.data.user.userName
                    const filteredResults = results.filter(item => item.userName !== userName);
                    setSearchResult(filteredResults);
                }
            });
        }
    }, [socket, userData, setSearchResult]);

    const [setDebouncedQuery, isLoading] = useDebounce(handleSearch, 300);

    const handleInputChange = (event) => {
        setQuery(event.target.value);

        if (event.target.value === '') {
            return setSearchResult([]);
        }

        setDebouncedQuery(event.target.value);
    };

    const handleClearInput = () => {
        setQuery('');
        setSearchResult([]);
    };

    const handleFocus = () => {
        setIsFocused(true);
        setBackState(true);

        const userName = userData.data.user.userName
        socket.current.emit('updateBackState', { backState: true, userName })
    };

    useEffect(() => {
        if (!backState) {
            setQuery('');
            setSearchResult([]);
        }
    }, [backState])

    return (
        <Box width='100%'>
            <TextField
                fullWidth
                placeholder='Search'
                variant="outlined"
                autoComplete='off'
                value={query}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={() => setIsFocused(false)}
                sx={{
                    bgcolor: grey[100],
                    borderRadius: 5,
                    overflow: 'hidden',
                    caretColor: blue[500],
                    '& .MuiOutlinedInput-root': {
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        '& input': {
                            py: 1,
                            flex: 1,
                        },
                        '& fieldset': {
                            borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                            borderColor: 'transparent',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: blue[500],
                            borderRadius: 5,
                        },
                    },
                }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                {isLoading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <SearchIcon sx={{ color: isFocused ? blue[500] : grey[500] }} />
                                )}
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position='end' sx={{ visibility: query ? 'visible' : 'hidden' }}>
                                <CloseSharpIcon onClick={handleClearInput} sx={{ cursor: 'pointer' }} />
                            </InputAdornment>
                        )
                    }
                }}
            />
        </Box>
    );
};

export default ChatSearch;
