import React, { useCallback, useEffect, useState } from 'react';
import { grey, blue } from '@mui/material/colors';
import { Box, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { CloseSharp, Search } from '@mui/icons-material';
import useDebounce from '../../utils/debounce';
import authStore from '../../stores/authStore';
import useSocketStore from '../../stores/socketStore';
import useSettingStore from '../../stores/settingStore';
import useDataStore from '../../stores/dataStore';

const ChatSearch = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');

    const socket = useSocketStore(state => state.socket);
    const backState = useSettingStore(state => state.backState);
    const setBackState = useSettingStore(state => state.setBackState);
    const setSearchResult = useDataStore(state => state.setSearchResult);
    const userName = authStore(state => state.userName);
    
    const handleSearch = useCallback((debouncedQuery) => {
        if (!socket || !debouncedQuery) return;
        
        const escapedQuery = debouncedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        socket.emit('search', escapedQuery, (error, results) => {
            if (error) {
                console.error('Search error:', error);
            } else {
                const filteredResults = results.filter(item => item.userName !== userName);
                setSearchResult(filteredResults);
            }
        });
    }, [socket, setSearchResult, userName]);

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
                                    <Search sx={{ color: isFocused ? blue[500] : grey[500] }} />
                                )}
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position='end' sx={{ visibility: query ? 'visible' : 'hidden' }}>
                                <CloseSharp onClick={handleClearInput} sx={{ cursor: 'pointer' }} />
                            </InputAdornment>
                        )
                    }
                }}
            />
        </Box>
    );
};

export default ChatSearch;
