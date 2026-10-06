import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';
import { createBookings, BookingConflictError, DailyLimitError } from '../api/bookings';
import { useRealtimeBookings } from '../hooks/useRealtimeBookings';
import type { RootStackParamList } from '../navigation/types';
import type { Slot } from '../types';
import { colors, radius, shadow } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'BookRoom'>;

export function BookRoomScreen({ route, navigation }: Props) {
  const { roomId, roomName, building, date } = route.params;
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number[]>([]);
  useRealtimeBookings(date);

  const slotsQ = useQuery({
    queryKey: ['slots'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.from('time_slots').select('*').order('id');
      if (error) throw error;
      return data as Slot[];
    },
  });
  const bookedQ = useQuery({
    queryKey: ['availability', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings').select('room_id, slot_id')
        .eq('booking_date', date).eq('status', 'confirmed');
      if (error) throw error;
      return data ?? [];
    },
  });

  const taken = useMemo(
    () => new Set((bookedQ.data ?? []).filter((b) => b.room_id === roomId).map((b) => b.slot_id)),
    [bookedQ.data, roomId]
  );

  useEffect(() => {
    setSelected((s) => s.filter((id) => !taken.has(id)));
  }, [taken]);

  const isPast = (slot: Slot) =>
    date === dayjs().format('YYYY-MM-DD') && slot.start_time.slice(0, 5) < dayjs().format('HH:mm');

  const mutation = useMutation({
    mutationFn: () => createBookings(roomId, date, selected),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability', date] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      Alert.alert('Thành công', `Đã đặt ${roomName} (${selected.length} ca).`);
      navigation.goBack();
    },
    onError: (err) => {
      qc.invalidateQueries({ queryKey: ['availability', date] });
      setSelected([]);
      if (err instanceof BookingConflictError) Alert.alert('Không đặt được', err.message);
      else if (err instanceof DailyLimitError) Alert.alert('Vượt giới hạn', err.message);
      else Alert.alert('Lỗi', (err as Error).message ?? 'Không thể đặt phòng, thử lại sau.');
    },
  });

  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (slotsQ.isLoading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{roomName}</Text>
      <Text style={styles.sub}>📍 {building}   📅 {dayjs(date).format('DD/MM/YYYY')}</Text>

      <Text style={styles.label}>Chọn ca (có thể chọn nhiều ca)</Text>
      <View style={styles.grid}>
        {(slotsQ.data ?? []).map((s) => {
          const disabled = taken.has(s.id) || isPast(s);
          const active = selected.includes(s.id);
          return (
            <Pressable
              key={s.id}
              disabled={disabled}
              onPress={() => toggle(s.id)}
              style={[styles.slot, disabled && styles.slotOff, active && styles.slotOn]}
            >
              {active && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                </View>
              )}
              <Text style={[styles.slotText, active && { color: colors.white }, disabled && { color: colors.textLight }]}>
                {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
              </Text>
              <Text style={[styles.slotSub, active && { color: 'rgba(255,255,255,0.75)' }, disabled && { color: colors.textLight }]}>
                {taken.has(s.id) ? 'Đã đặt' : isPast(s) ? 'Đã qua' : 'Trống'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        disabled={selected.length === 0 || mutation.isPending}
        onPress={() => mutation.mutate()}
        style={[styles.btn, selected.length === 0 && styles.btnDisabled]}
      >
        <Text style={[styles.btnText, selected.length === 0 && { color: colors.textMuted }]}>
          {mutation.isPending ? 'Đang đặt...' : `Xác nhận (${selected.length} ca)`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, marginTop: 4 },
  label: { marginTop: 24, marginBottom: 10, fontWeight: '700', color: colors.text, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slot: {
    width: '47%', padding: 16, borderRadius: radius.lg, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border, ...shadow,
  },
  slotOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  slotOff: { backgroundColor: colors.border, borderColor: colors.border, shadowOpacity: 0 },
  slotText: { fontWeight: '700', color: colors.text, fontSize: 15 },
  slotSub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  checkBadge: {
    position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  btn: { marginTop: 28, backgroundColor: colors.navy, padding: 16, borderRadius: radius.md, alignItems: 'center' },
  btnDisabled: { backgroundColor: colors.border },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});