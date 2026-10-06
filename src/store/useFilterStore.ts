// src/store/useFilterStore.ts
import { create } from 'zustand';
import dayjs from 'dayjs';
import type { StatusFilter } from '../types';

interface FilterState {
  query: string;
  date: string;                  // 'YYYY-MM-DD'
  status: StatusFilter;
  minCapacity: number | null;
  building: string | null;
  setQuery: (q: string) => void;
  setDate: (d: string) => void;
  setStatus: (s: StatusFilter) => void;
  setMinCapacity: (n: number | null) => void;
  setBuilding: (b: string | null) => void;
  reset: () => void;
}

const initial = {
  query: '', date: dayjs().format('YYYY-MM-DD'),
  status: 'all' as StatusFilter, minCapacity: null, building: null,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initial,
  setQuery: (query) => set({ query }),
  setDate: (date) => set({ date }),
  setStatus: (status) => set({ status }),
  setMinCapacity: (minCapacity) => set({ minCapacity }),
  setBuilding: (building) => set({ building }),
  reset: () => set(initial),
}));