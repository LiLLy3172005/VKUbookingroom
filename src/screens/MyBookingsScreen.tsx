import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { fetchMyBookings, cancelBooking } from '../api/bookings';
import type { MyBooking } from '../types';
import { SwipeToCancel } from '../components/SwipeToCancel';

type Row =
  | { type: 'header'; key: string; title: string }
  | { type: 'booking'; key: string; b: MyBooking };

export function MyBookingsScreen() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({ queryKey: ['my-bookings'], queryFn: fetchMyBookings });

  const cancelM = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (e) => Alert.alert('Lỗi', (e as Error).message),
  });

  const rows = useMemo<Row[]>(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const all = data ?? [];
    const key = (b: MyBooking) => `${b.booking_date}-${b.slot_id}`;
    const upcoming = all.filter((b) => b.booking_date >= today).sort((a, b) => key(a).localeCompare(key(b)));
    const past = all.filter((b) => b.booking_date < today).sort((a, b) => key(b).localeCompare(key(a)));
    const out: Row[] = [];
    if (upcoming.length) {
      out.push({ type: 'header', key: 'h1', title: 'Sắp tới' });
      upcoming.forEach((b) => out.push({ type: 'booking', key: b.id, b }));
    }
    if (past.length) {
      out.push({ type: 'header', key: 'h2', title: 'Đã qua' });
      past.forEach((b) => out.push({ type: 'booking', key: b.id, b }));
    }
    return out;
  }, [data]);

  const confirmCancel = (b: MyBooking) =>
    Alert.alert('Hủy đặt phòng?', `${b.rooms.name} - ${dayjs(b.booking_date).format('DD/MM/YYYY')}`, [
      { text: 'Không', style: 'cancel' },
      { text: 'Hủy phòng', style: 'destructive', onPress: () => cancelM.mutate(b.id) },
    ]);

  const today = dayjs().format('YYYY-MM-DD');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Lịch của tôi</Text>
      <FlashList
        data={rows}
        keyExtractor={(r) => r.key}
        getItemType={(r) => r.type}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={<Text style={styles.empty}>{isLoading ? 'Đang tải...' : 'Bạn chưa đặt phòng nào'}</Text>}
        renderItem={({ item }) => {
          if (item.type === 'header') return <Text style={styles.section}>{item.title}</Text>;

          const b = item.b;
          const upcoming = b.booking_date >= today;

          const card = (
            <View style={styles.card}>
              <View style={styles.stripe} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{b.rooms.name}</Text>
                <Text style={styles.meta}>📍 {b.rooms.building}</Text>
                <View style={styles.timeRow}>
                  <Text style={styles.meta}>📅 {dayjs(b.booking_date).format('DD/MM/YYYY')}</Text>
                  <Text style={styles.meta}>🕒 {b.time_slots.start_time.slice(0, 5)}-{b.time_slots.end_time.slice(0, 5)}</Text>
                </View>
              </View>
              {upcoming && (
                <Pressable style={styles.cancel} onPress={() => confirmCancel(b)} disabled={cancelM.isPending}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </Pressable>
              )}
            </View>
          );

          // Booking sắp tới: cho vuốt sang trái để hủy. Booking đã qua: hiển thị thường, không vuốt được.
          return upcoming ? (
            <SwipeToCancel onCancel={() => confirmCancel(b)}>{card}</SwipeToCancel>
          ) : (
            card
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', padding: 16 },
  section: { fontSize: 15, fontWeight: '700', color: '#475569', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#94A3B8' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  meta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  cancel: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FEE2E2' },
  cancelText: { color: '#DC2626', fontWeight: '700' },
  stripe: { width: 4, height: '100%', backgroundColor: '#1E3A8A', borderRadius: 2, marginRight: 12 },
  timeRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
});