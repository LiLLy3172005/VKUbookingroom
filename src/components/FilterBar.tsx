import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useFilterStore } from '../store/useFilterStore';
import { colors, radius } from '../theme/colors';

const STATUS_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Còn trống' },
  { key: 'occupied', label: 'Hết chỗ' },
] as const;

const CAPACITY_OPTIONS = [10, 30, 50];

export function FilterBar() {
  const { date, status, minCapacity, setDate, setStatus, setMinCapacity } = useFilterStore();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Pressable onPress={() => setShowPicker(true)} style={[styles.chip, styles.dateChip]}>
          <Text style={styles.dateText}>📅 {dayjs(date).format('DD/MM')}</Text>
        </Pressable>

        {STATUS_OPTIONS.map((o) => (
          <Pressable
            key={o.key}
            onPress={() => setStatus(o.key)}
            style={[styles.chip, status === o.key && styles.active]}
          >
            <Text style={status === o.key ? styles.textActive : styles.text}>{o.label}</Text>
          </Pressable>
        ))}

        {CAPACITY_OPTIONS.map((n) => (
          <Pressable
            key={n}
            onPress={() => setMinCapacity(minCapacity === n ? null : n)}
            style={[styles.chip, minCapacity === n && styles.active]}
          >
            <Text style={minCapacity === n ? styles.textActive : styles.text}>≥ {n} chỗ</Text>
          </Pressable>
        ))}
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={dayjs(date).toDate()}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) setDate(dayjs(d).format('YYYY-MM-DD'));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChip: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  dateText: { color: colors.navy, fontWeight: '700', fontSize: 13 },
  active: { backgroundColor: colors.navy, borderColor: colors.navy },
  text: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  textActive: { color: colors.white, fontWeight: '700', fontSize: 13 },
});