import { create } from 'zustand';

const useAuthStore = create((set) => ({
    isAuthenticated: false,
    userData: {},
    loading: true,
    userName: '',
    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setLoading: (value) => set({ loading: value }),
    setUserData: (data) => {
        set({ 
            userData: data,
            userName: data.data.user.userName || ''
        });
    },
}));

export default useAuthStore; 