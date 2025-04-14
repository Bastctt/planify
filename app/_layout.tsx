import { useEffect } from 'react';

// expo
import { Stack } from 'expo-router';


import { StatusBar } from 'expo-status-bar';

// config
import { appConfig } from '../config/appConfig';

// lib
import Toast from 'react-native-toast-message';

// context
import { ThemeProvider } from '../context/themeContext';

import { Provider as PaperProvider } from 'react-native-paper';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useEffect(() => {
    const defaultExpoUrl = process.env.EXPO_PUBLIC_URL || '';
    appConfig.expoUrl = defaultExpoUrl;

    window.frameworkReady?.();
  }, []);

  return (
    <ThemeProvider>
      <PaperProvider>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast />
        <StatusBar style="auto" />
      </>
      </PaperProvider>
    </ThemeProvider>
  );
}
