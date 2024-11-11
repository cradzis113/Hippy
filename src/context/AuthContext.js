import React, { createContext, useState, useContext, useEffect } from 'react';
import fetchAPI from '../utils/FetchApi';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({})

  const login = () => setIsAuthenticated(true);

  const logout = async () => {
    try {
      const response = await fetchAPI('http://localhost:3001/api/clear-cookie', 'POST', null, null, true);
      if (response.status === 200) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAPI('http://localhost:3001/api/getuserdata', 'GET', null, null, true);

        if (response.status === 200) {
          setUserData(response);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    if (!Cookies.get('userStatus')) {
      setLoading(false)
      setIsAuthenticated(false);
    } else {
      fetchData()
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, setUserData, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
