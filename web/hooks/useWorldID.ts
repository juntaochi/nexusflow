import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WorldIDState {
  isVerified: boolean;
  proof: any | null;
  setVerified: (proof: any) => void;
  reset: () => void;
}

const getStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
};

export const useWorldIDStore = create<WorldIDState>()(
  persist(
    (set) => ({
      isVerified: false,
      proof: null,
      setVerified: (proof) => set({ isVerified: true, proof }),
      reset: () => set({ isVerified: false, proof: null }),
    }),
    {
      name: 'world-id-storage',
      storage: createJSONStorage(() => getStorage()),
    }
  )
);
