import { useEffect } from "react";
import fetchAPI from "../utils/FetchApi";
import useAuthStore from "../stores/authStore";

const API_BASE = window.location.protocol === "https:"
  ? import.meta.env.VITE_API_URL_TUNNEL
  : `http://${window.location.hostname}:3001`;

export default function userSessionService() {
    const setUserData = useAuthStore(state => state.setUserData);
    const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);
    const setLoading = useAuthStore(state => state.setLoading);

    useEffect(() => {
        const getUserData = async () => {
          const token = localStorage.getItem('token');
          if (!token) return setLoading(false);
    
          try {
            let response = await fetchAPI(`${API_BASE}/api/user`, 'POST', { token }, null, false);
            if (response.status === 200 || response.status === 201) {
              if (response.data.status === 'error') {
                const refreshResponse = await fetchAPI(`${API_BASE}/api/refresh-token`, 'POST', null, null, true);
    
                if (refreshResponse.status === 200 && refreshResponse.data.token) {
                  localStorage.setItem('token', refreshResponse.data.token);
    
                  response = await fetchAPI(`${API_BASE}/api/user`, 'POST', { token: refreshResponse.data.token }, null, false);
    
                  if (response.data.status !== 'error') {
                    setUserData(response);
                    setIsAuthenticated(true);
                  } else {
                    setIsAuthenticated(false);
                  }
                } else {
                  setIsAuthenticated(false);
                }
              } else {
                setUserData(response);
                setIsAuthenticated(true);
              }
            }
          } catch (error) {
            console.error('Error fetching data:', error);
            setIsAuthenticated(false);
          } finally {
            setLoading(false);
          }
        };
    
        getUserData();
      }, []);
}
