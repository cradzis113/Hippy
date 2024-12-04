import React, { createContext, useContext, useState } from 'react';

const SettingContext = createContext();

export const SettingProvider = ({ children }) => {
    const [backState, setBackState] = useState(false);
    const [pinnedViewActive, setPinnedViewActive] = useState(false);
    const [activeSelectedMessage, setActiveSelectedMessage] = useState(false);

    return (
        <SettingContext.Provider value={{ backState, setBackState, pinnedViewActive, setPinnedViewActive, activeSelectedMessage, setActiveSelectedMessage }}>
            {children}
        </SettingContext.Provider>
    );
};

export const useSetting = () => {
    return useContext(SettingContext);
};
