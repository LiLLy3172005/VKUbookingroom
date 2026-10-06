import React, { useCallback, useDeferredValue, useMemo } from 'react';
import { Text, TextInput, View, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RoomCard } from '../components/RoomCard';
import { FilterBar } from '../components/FilterBar';
import { useFilterStore } from '../store/useFilterStore';
import { useRoomsWithAvailability } from '../hooks/useRoomsWithAvailability';
import { useRealtimeBookings } from '../hooks/useRealtimeBookings';
import { normalize } from '../utils/text';
import type { RoomWithAvailability } from '../types';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius } from '../theme/colors';

export function BrowseRoomsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { query, date, status, minCapacity, building, setQuery } = useFilterStore();
  const deferredQuery = useDeferredValue(query);
  const { data: rooms, isLoading, isError, refetch } = useRoomsWithAvailability(date);
  useRealtimeBookings(date);

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery);
    return rooms.filter((r) => {
      if (q && !normalize(`${r.name} ${r.building}`).includes(q)) return false;
      if (status === 'available' && !r.isAvailable) return false;
      if (status === 'occupied' && r.isAvailable) return false;
      if (minCapacity && r.capacity < minCapacity) return false;
      if (building && r.building !== building) return false;
      return true;
    });
  }, [rooms, deferredQuery, status, minCapacity, building]);

  const onBook = useCallback(
    (room: RoomWithAvailability) =>
      navigation.navigate('BookRoom', { roomId: room.id, roomName: room.name, building: room.building, date }),
    [navigation, date]
  );
  const renderItem = useCallback(
    ({ item, index }: { item: RoomWithAvailability; index: number }) => (
      <RoomCard room={item} index={index} onBook={onBook} />
    ),
    [onBook]
  );

  const availableCount = rooms.filter((r) => r.isAvailable).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.hello}>Xin chào 👋</Text>
            <Text style={styles.title}>Khám phá phòng học</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 18 }}>🎓</Text>
          </View>
        </View>
        <Text style={styles.sub}>{availableCount} phòng đang trống hôm nay</Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm phòng, tòa nhà..."
            placeholderTextColor={colors.textLight}
            returnKeyType="search"
            autoCapitalize="none"
          />
        </View>
      </SafeAreaView>

      <FilterBar />

      {isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Không tải được dữ liệu. Kiểm tra kết nối mạng.</Text>
          <Pressable style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          ListEmptyComponent={
            <Text style={styles.empty}>{isLoading ? 'Đang tải...' : 'Không có phòng phù hợp'}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 },
  hello: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 14 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.full, paddingHorizontal: 16, height: 48,
    borderWidth: 1, borderColor: colors.border,
  },
  searchIcon: { marginRight: 8, fontSize: 15 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  empty: { textAlign: 'center', marginTop: 40, color: colors.textLight },
  errorBox: { alignItems: 'center', marginTop: 60, gap: 12 },
  errorText: { color: colors.textMuted, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { backgroundColor: colors.navy, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.full },
  retryText: { color: colors.white, fontWeight: '700' },
});