
export type Role = 'student' | 'teacher';
export type StatusFilter = 'all' | 'available' | 'occupied';

export interface Room {
  id: string; name: string; building: string;
  capacity: number; photo_url: string | null;
}
export interface Slot { id: number; start_time: string; end_time: string; }
export interface Booking {
  id: string; room_id: string; booking_date: string;
  slot_id: number; status: 'confirmed' | 'cancelled';
}
export interface RoomWithAvailability extends Room {
  freeSlotIds: number[];
  isAvailable: boolean;
}


export interface MyBooking {
  id: string;
  room_id: string;
  booking_date: string;
  slot_id: number;
  status: 'confirmed' | 'cancelled';
  rooms: { name: string; building: string; photo_url: string | null };
  time_slots: { start_time: string; end_time: string };
}

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  code: string | null;
}