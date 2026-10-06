import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../api/supabase';
import type { Room, Slot, RoomWithAvailability } from '../types';

export function useRoomsWithAvailability(date: string) {
  const rooms = useQuery({
    queryKey: ['rooms'],
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('rooms').select('*').eq('is_active', true);
      if (error) throw error;
      return data as Room[];
    },
  });
  const slots = useQuery({
    queryKey: ['slots'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.from('time_slots').select('*').order('id');
      if (error) throw error;
      return data as Slot[];
    },
  });
  const booked = useQuery({
    queryKey: ['availability', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings').select('room_id, slot_id')
        .eq('booking_date', date).eq('status', 'confirmed');
      if (error) throw error;
      return data ?? [];
    },
  });

  const data = useMemo<RoomWithAvailability[]>(() => {
    if (!rooms.data || !slots.data) return [];
    const bookedByRoom = new Map<string, Set<number>>();
    booked.data?.forEach((b) => {
      if (!bookedByRoom.has(b.room_id)) bookedByRoom.set(b.room_id, new Set());
      bookedByRoom.get(b.room_id)!.add(b.slot_id);
    });
    return rooms.data.map((r) => {
      const taken = bookedByRoom.get(r.id) ?? new Set();
      const freeSlotIds = slots.data!.map((s) => s.id).filter((id) => !taken.has(id));
      return { ...r, freeSlotIds, isAvailable: freeSlotIds.length > 0 };
    });
  }, [rooms.data, slots.data, booked.data]);

  return {
    data,
    isLoading: rooms.isLoading || slots.isLoading || booked.isLoading,
    isError: rooms.isError || slots.isError || booked.isError,
    refetch: () => {
      rooms.refetch();
      slots.refetch();
      booked.refetch();
    },
  };
}