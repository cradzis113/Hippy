import React, { createContext, useContext, useState } from 'react';

const SettingContext = createContext();

export const SettingProvider = ({ children }) => {
    const [backState, setBackState] = useState(false);

    return (
        <SettingContext.Provider value={{ backState, setBackState }}>
            {children}
        </SettingContext.Provider>
    );
};

export const useSetting = () => {
    return useContext(SettingContext);
};
