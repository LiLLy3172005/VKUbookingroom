import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (roomId: string) => void;
  isFavorite: (roomId: string) => boolean;
}

// Đúng mẫu slide trang 12: create() + persist() + AsyncStorage
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (roomId) =>
        set((s) => ({
          favoriteIds: s.favoriteIds.includes(roomId)
            ? s.favoriteIds.filter((id) => id !== roomId)
            : [...s.favoriteIds, roomId],
        })),
      isFavorite: (roomId) => get().favoriteIds.includes(roomId),
    }),
    {
      name: 'vku-favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);