import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';
import { useFavoritesStore } from '../store/useFavoritesStore';
import type { Profile } from '../types';
import { colors, radius, shadow } from '../theme/colors';

export function ProfileScreen() {
  const qc = useQueryClient();
  const navigation = useNavigation();
  const favCount = useFavoritesStore((s) => s.favoriteIds.length);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: p, error } = await supabase.from('profiles').select('*').eq('id', u.user!.id).single();
      if (error) throw error;
      return { profile: p as Profile, email: u.user!.email ?? '' };
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
  };

  const soon = () => Alert.alert('Sắp ra mắt', 'Tính năng này đang được phát triển.');

  const menu = [
    { icon: 'calendar-outline' as const, label: 'Lịch của tôi', onPress: () => navigation.navigate('MyBookings' as never) },
    { icon: 'heart-outline' as const, label: `Phòng yêu thích (${favCount})`, onPress: soon },
    { icon: 'settings-outline' as const, label: 'Cài đặt', onPress: soon },
    { icon: 'help-circle-outline' as const, label: 'Trợ giúp', onPress: soon },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Cá nhân</Text>

      {isLoading || !data ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{data.profile.role === 'teacher' ? '👨‍🏫' : '🎓'}</Text>
            </View>
            <Text style={styles.name}>{data.profile.full_name}</Text>
            <Text style={styles.email}>{data.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {data.profile.role === 'teacher' ? 'Giáo viên' : 'Sinh viên'}
                {data.profile.code ? `  ·  ${data.profile.code}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.menuCard}>
            {menu.map((m, i) => (
              <Pressable
                key={m.label}
                style={[styles.menuRow, i < menu.length - 1 && styles.menuRowBorder]}
                onPress={m.onPress}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={m.icon} size={20} color={colors.navy} />
                  <Text style={styles.menuLabel}>{m.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.logout} onPress={signOut}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text, padding: 16 },
  profileCard: {
    backgroundColor: colors.card, marginHorizontal: 16, padding: 20, borderRadius: radius.lg,
    alignItems: 'center', gap: 4, ...shadow,
  },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  avatarEmoji: { fontSize: 38 },
  name: { fontSize: 19, fontWeight: '700', color: colors.text, marginTop: 4 },
  email: { color: colors.textMuted, fontSize: 13 },
  roleBadge: { marginTop: 8, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  roleText: { fontSize: 12, fontWeight: '600', color: colors.navy },
  menuCard: {
    backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: radius.lg,
    overflow: 'hidden', ...shadow,
  },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
  logout: { margin: 16, marginTop: 20, padding: 15, borderRadius: radius.md, backgroundColor: '#FEE2E2', alignItems: 'center' },
  logoutText: { color: colors.busy, fontWeight: '700' },
});