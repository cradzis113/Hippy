import { create } from 'zustand'

const useSettingStore = create((set) => ({
  backState: false,
  pinnedViewActive: false,
  activeSelectedMessage: false,
  isFirstLoad: true,
  hasEmittedSeen: false,
  
  setBackState: (value) => set({ backState: value }),
  setPinnedViewActive: (value) => set({ pinnedViewActive: value }),
  setActiveSelectedMessage: (value) => set({ activeSelectedMessage: value }),
  setIsFirstLoad: (value) => set({ isFirstLoad: value }),
  setHasEmittedSeen: (value) => set({ hasEmittedSeen: value }),
}))

export default useSettingStore 