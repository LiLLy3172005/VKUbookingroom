import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { colors, radius } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  onCancel: () => void;
}

const THRESHOLD = -90;

export function SwipeToCancel({ children, onCancel }: Props) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX(-10) // chỉ bắt gesture ngang, không đụng cuộn dọc của list
    .onUpdate((e) => {
      translateX.value = Math.max(THRESHOLD - 20, Math.min(0, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX < THRESHOLD) {
        runOnJS(onCancel)();
      }
      translateX.value = withSpring(0);
    });

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const bgStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / Math.abs(THRESHOLD)),
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.bg, bgStyle]}>
        <Text style={styles.bgText}>Hủy</Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  bg: {
    position: 'absolute', right: 16, top: 6, bottom: 6, width: 90,
    backgroundColor: colors.busy, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  bgText: { color: colors.white, fontWeight: '800' },
});