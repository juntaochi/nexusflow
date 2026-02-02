import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "cyberpunk";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const getStorage = () => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "cyberpunk",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => getStorage()),
    },
  ),
);
