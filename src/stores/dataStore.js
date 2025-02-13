import { create } from 'zustand';

const useDataStore = create((set) => ({
  // Search and carousel states
  searchResult: [],
  setSearchResult: (result) => set({ searchResult: result }),
  carouselSlides: [],
  setCarouselSlides: (slides) => set({ carouselSlides: slides }),

  // Chat related states
  currentChatUser: {},
  setCurrentChatUser: (user) => set({ currentChatUser: user }),
  selectedMessages: [],
  setSelectedMessages: (updater) =>
    set((state) => ({
      selectedMessages:
        typeof updater === "function" ? updater(state.selectedMessages) : updater,
    })),
  storedMessages: {},
  setStoredMessages: (messages) => set({ storedMessages: messages }),
  focusMessage: null,
  setFocusMessage: (message) => set({ focusMessage: message }),
}));

export default useDataStore; 