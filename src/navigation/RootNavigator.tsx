import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseRoomsScreen } from '../screens/BrowseRoomsScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BookRoomScreen } from '../screens/BookRoomScreen';
import type { RootStackParamList } from './types';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const ICONS: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }> = {
  Browse: { on: 'search', off: 'search-outline' },
  MyBookings: { on: 'calendar', off: 'calendar-outline' },
  Profile: { on: 'person', off: 'person-outline' },
};

function Tabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => (
          <View
            style={{
              width: 42, height: 42, borderRadius: 21,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: focused ? colors.navy : 'transparent',
            }}
          >
            <Ionicons
              name={focused ? ICONS[route.name].on : ICONS[route.name].off}
              size={20}
              color={focused ? colors.white : color}
            />
          </View>
        ),
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 12,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
        },
      })}
    >
      <Tab.Screen name="Browse" component={BrowseRoomsScreen} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="BookRoom"
          component={BookRoomScreen}
          options={{
            title: 'Đặt phòng',
            headerStyle: { backgroundColor: colors.navy },
            headerTintColor: colors.white,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}