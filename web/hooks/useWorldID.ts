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

// Check if bypass is enabled (only in development)
const isBypassEnabled = () => {
  if (typeof window === 'undefined') return false;
  return process.env.NEXT_PUBLIC_BYPASS_WORLDID === 'true';
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

// Hook that respects bypass setting
export function useWorldID() {
  const store = useWorldIDStore();
  const bypass = isBypassEnabled();

  return {
    ...store,
    isVerified: bypass ? true : store.isVerified,
    isBypassed: bypass,
  };
}
