import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../api/supabase';
import { colors, radius } from '../theme/colors';

interface Props {
  onGoRegister: () => void;
}

const HERO = 'https://images.pexels.com/photos/356065/pexels-photo-356065.jpeg?cs=tinysrgb&dpr=1&w=800';

export function LoginScreen({ onGoRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email.trim() || !password) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert('Đăng nhập thất bại', error.message);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.hero}>
        <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <SafeAreaView edges={['top']} style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <Text style={styles.heroBrand}>VKU Room Booking</Text>
        </SafeAreaView>
        <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
          <Text style={styles.heroTitle}>Phòng học chờ{'\n'}bạn ngay đây</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TextInput
          style={styles.input} placeholder="Email hoặc mã sinh viên" autoCapitalize="none"
          keyboardType="email-address" value={email} onChangeText={setEmail}
          placeholderTextColor={colors.textLight}
        />
        <TextInput
          style={styles.input} placeholder="Mật khẩu" secureTextEntry
          value={password} onChangeText={setPassword}
          placeholderTextColor={colors.textLight}
        />
        <Pressable style={styles.btn} onPress={signIn} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</Text>
        </Pressable>
        <Pressable onPress={onGoRegister} disabled={loading}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: '42%',
    justifyContent: 'space-between',
    backgroundColor: colors.navy, // màu nền dự phòng nếu ảnh chưa tải kịp
    overflow: 'hidden',
  },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.22)' },
  heroBrand: { color: colors.white, fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 30, fontWeight: '800', lineHeight: 36 },
  sheet: { flex: 1, padding: 24, gap: 12, justifyContent: 'center' },
  input: {
    padding: 14, borderRadius: radius.md, backgroundColor: colors.card,
    fontSize: 15, borderWidth: 1, borderColor: colors.border, color: colors.text,
  },
  btn: { backgroundColor: colors.navy, padding: 15, borderRadius: radius.md, alignItems: 'center', marginTop: 6 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: colors.navy, marginTop: 10, fontWeight: '600' },
});