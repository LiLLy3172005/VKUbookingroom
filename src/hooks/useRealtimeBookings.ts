import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';

export function useRealtimeBookings(date: string) {
  const qc = useQueryClient();
  const idRef = useRef(Math.random().toString(36).slice(2)); // ID riêng cho mỗi lần dùng hook

  useEffect(() => {
    const channel = supabase
      .channel(`bookings-${date}-${idRef.current}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `booking_date=eq.${date}` },
        () => qc.invalidateQueries({ queryKey: ['availability', date] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, qc]);
}