import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [searchResult, setSearchResult] = useState([]);
    const [currentChatUser, setCurrentChatUser] = useState({})
    const [messageBackState, setMessageBackState] = useState({})

    return (
        <DataContext.Provider value={{ searchResult, setSearchResult, currentChatUser, setCurrentChatUser, messageBackState, setMessageBackState }}>
            {children}
        </DataContext.Provider>
    );
};
