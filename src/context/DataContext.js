import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [searchResult, setSearchResult] = useState([]);
    const [carouselSlides, setCarouselSlides] = useState([]);

    const [currentChatUser, setCurrentChatUser] = useState({})
    const [selectedMessages, setSelectedMessages] = useState([]);

    const [focusMessage, setFocusMessage] = useState(null);
    const [messageBackState, setMessageBackState] = useState({ messages: [], user: null });

    return (
        <DataContext.Provider value={{
            carouselSlides,
            setCarouselSlides,
            searchResult,
            setSearchResult,
            currentChatUser,
            setCurrentChatUser,
            messageBackState,
            setMessageBackState,
            selectedMessages,
            setSelectedMessages,
            focusMessage,
            setFocusMessage
        }}>
            {children}
        </DataContext.Provider>
    );
};
