import { supabase } from './supabase';
import type { MyBooking } from '../types';

export class BookingConflictError extends Error {
  kind: 'room' | 'user';
  constructor(kind: 'room' | 'user') {
    super(kind === 'room'
      ? 'Khung giờ này vừa có người đặt trước bạn.'
      : 'Bạn đã có lịch ở một phòng khác trong ca này.');
    Object.setPrototypeOf(this, BookingConflictError.prototype);
    this.kind = kind;
  }
}

export class DailyLimitError extends Error {
  constructor() {
    super('Bạn đã đạt giới hạn số ca đặt trong ngày.');
    Object.setPrototypeOf(this, DailyLimitError.prototype);
  }
}

export async function createBookings(roomId: string, date: string, slotIds: number[]) {
  const rows = slotIds.map((slot_id) => ({ room_id: roomId, booking_date: date, slot_id }));
  const { data, error } = await supabase.from('bookings').insert(rows).select();

  if (error) {
    if (error.code === '23505') {
      throw new BookingConflictError(error.message.includes('uq_user_slot') ? 'user' : 'room');
    }
    if (error.message.includes('DAILY_LIMIT')) throw new DailyLimitError();
    throw error;
  }
  return data;
}

export async function cancelBooking(id: string) {
  const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

export async function fetchMyBookings(): Promise<MyBooking[]> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select('*, rooms(name, building, photo_url), time_slots(start_time, end_time)')
    .eq('user_id', uid)               // chỉ lấy lịch của chính mình
    .eq('status', 'confirmed')
    .order('booking_date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as MyBooking[];
}