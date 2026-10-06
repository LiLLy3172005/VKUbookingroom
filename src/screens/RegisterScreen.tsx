import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, Image,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../api/supabase';
import { colors, radius } from '../theme/colors';

interface Props {
  onBackToLogin: () => void;
}

const HERO = 'https://images.pexels.com/photos/6333859/pexels-photo-6333859.jpeg?auto=compress&cs=tinysrgb&w=800';

export function RegisterScreen({ onBackToLogin }: Props) {
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!fullName.trim()) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.');
    if (!email.trim()) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập email.');
    if (password.length < 6) return Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu cần ít nhất 6 ký tự.');
    if (password !== confirm) return Alert.alert('Mật khẩu không khớp', 'Hai mật khẩu nhập vào chưa giống nhau.');

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim(), code: code.trim() || null } },
    });
    setLoading(false);

    if (error) return Alert.alert('Đăng ký thất bại', error.message);
    if (!data.session) {
      Alert.alert('Kiểm tra email', 'Vui lòng xác nhận email trước khi đăng nhập.', [
        { text: 'OK', onPress: onBackToLogin },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.hero}>
        <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <SafeAreaView edges={['top']} style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={styles.heroBrand}>VKU Room Booking</Text>
        </SafeAreaView>
        <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
          <Text style={styles.heroTitle}>Tạo tài khoản</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
          <TextInput style={styles.input} placeholder="Họ và tên" value={fullName} onChangeText={setFullName} placeholderTextColor={colors.textLight} />
          <TextInput style={styles.input} placeholder="Mã SV / Mã GV (không bắt buộc)" value={code} onChangeText={setCode} autoCapitalize="characters" placeholderTextColor={colors.textLight} />
          <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholderTextColor={colors.textLight} />
          <TextInput style={styles.input} placeholder="Mật khẩu (≥ 6 ký tự)" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor={colors.textLight} />
          <TextInput style={styles.input} placeholder="Nhập lại mật khẩu" secureTextEntry value={confirm} onChangeText={setConfirm} placeholderTextColor={colors.textLight} />

          <Pressable style={styles.btn} onPress={signUp} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Đang xử lý...' : 'Đăng ký'}</Text>
          </Pressable>
          <Pressable onPress={onBackToLogin} disabled={loading}>
            <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: '30%',
    justifyContent: 'space-between',
    backgroundColor: colors.navy,
    overflow: 'hidden',
  },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.22)' },
  heroBrand: { color: colors.white, fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 26, fontWeight: '800' },
  sheet: { padding: 24, gap: 12 },
  input: {
    padding: 14, borderRadius: radius.md, backgroundColor: colors.card,
    fontSize: 15, borderWidth: 1, borderColor: colors.border, color: colors.text,
  },
  btn: { backgroundColor: colors.navy, padding: 15, borderRadius: radius.md, alignItems: 'center', marginTop: 4 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: colors.navy, marginTop: 10, fontWeight: '600' },
});