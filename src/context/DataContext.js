import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [searchResult, setSearchResult] = useState([]);
    const [currentChatUser, setCurrentChatUser] = useState({})

    return (
        <DataContext.Provider value={{ searchResult, setSearchResult, currentChatUser, setCurrentChatUser }}>
            {children}
        </DataContext.Provider>
    );
};
