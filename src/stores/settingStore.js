import { create } from 'zustand'

const useSettingStore = create((set) => ({
  backState: false,
  pinnedViewActive: false,
  activeSelectedMessage: false,
  isFirstLoad: true,
  
  setBackState: (value) => set({ backState: value }),
  setPinnedViewActive: (value) => set({ pinnedViewActive: value }),
  setActiveSelectedMessage: (value) => set({ activeSelectedMessage: value }),
  setIsFirstLoad: (value) => set({ isFirstLoad: value }),
}))

export default useSettingStore 