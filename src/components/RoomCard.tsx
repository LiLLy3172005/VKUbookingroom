import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { RoomWithAvailability } from '../types';
import { colors, radius, shadow } from '../theme/colors';
import { useFavoritesStore } from '../store/useFavoritesStore';

interface Props {
  room: RoomWithAvailability;
  index: number;
  onBook: (room: RoomWithAvailability) => void;
}

function RoomCardBase({ room, index, onBook }: Props) {
  const scale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isFav = useFavoritesStore((s) => s.isFavorite(room.id));
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60).springify().damping(14)}
      style={styles.card}
    >
      <View>
        <Image
          source={room.photo_url ? { uri: room.photo_url } : require('../../assets/icon.png')}
          style={styles.photo}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <Pressable style={styles.favBtn} hitSlop={8} onPress={() => toggleFav(room.id)}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={17}
            color={isFav ? colors.red : colors.navy}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
        <Text style={styles.meta}>📍 {room.building}  ·  👥 {room.capacity} chỗ</Text>

        <View style={styles.footer}>
          <View style={[styles.badge, room.isAvailable ? styles.badgeOk : styles.badgeBusy]}>
            <View style={[styles.dot, { backgroundColor: room.isAvailable ? colors.green : colors.busy }]} />
            <Text style={[styles.badgeText, { color: room.isAvailable ? colors.green : colors.busy }]}>
              {room.isAvailable ? `Còn trống (${room.freeSlotIds.length} ca)` : 'Hết chỗ'}
            </Text>
          </View>

          {room.isAvailable && (
            <Animated.View style={btnStyle}>
              <Pressable
                onPressIn={() => { scale.value = withSpring(0.93); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                onPress={() => onBook(room)}
                style={styles.btn}
                hitSlop={8}
              >
                <Text style={styles.btnText}>Đặt ngay</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export const RoomCard = memo(RoomCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    ...shadow,
  },
  photo: { width: '100%', height: 160, backgroundColor: colors.border },
  favBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  body: { padding: 14, gap: 6 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  badgeOk: { backgroundColor: '#DCFCE7' },
  badgeBusy: { backgroundColor: '#FEE2E2' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  btn: { backgroundColor: colors.navy, paddingHorizontal: 18, paddingVertical: 9, borderRadius: radius.full },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});