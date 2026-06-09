import { create } from 'zustand';

const useThemeStore = create((set) => ({
  isDarkMode: false,
  toggleTheme: () =>
    set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDarkMode: (value) => set({ isDarkMode: value }),
}));

export default useThemeStore;
