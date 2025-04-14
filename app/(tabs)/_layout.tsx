import React, { useEffect, useContext } from 'react';

// expo & react-native
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Badge } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// context
import { ThemeContext } from '../../context/themeContext';

// store
import { useNotificationsStore } from '@/stores/notificationsStore';

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);
  const { count: notificationCount, fetchCount, loading: notifLoading } = useNotificationsStore();

  const tabBarStyle = {
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? '#444' : '#e5e5e5',
  };

  const tabBarActiveTintColor = theme === 'dark' ? '#fff' : '#0055FF';
  const tabBarInactiveTintColor = theme === 'dark' ? '#bbb' : '#666';

  useEffect(() => {
    fetchCount();
    const intervalId = setInterval(fetchCount, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Workspaces',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ size, color }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name="notifications-outline" size={size} color={color} />
              {notificationCount > 0 && (
                <Badge
                  visible
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                  }}
                  size={16}
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
