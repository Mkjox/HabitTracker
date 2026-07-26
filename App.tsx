import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { initializeDatabase } from './src/assets/data/database';
import { useHabitStore } from './src/store/useHabitStore';
import { startAutoBackup, stopAutoBackup, DEFAULT_BACKUP_INTERVAL_MS } from './src/assets/data/backup';
import { View, ActivityIndicator } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomStatusBar from './src/components/CustomStatusBar';
import { registerForPushNotificationsAsync } from './src/lib/notifications';
import { saveNotificationToHistory, syncPresentedNotifications } from './src/lib/notificationHistory';
import * as Notifications from 'expo-notifications';
import { initI18n } from './src/lib/i18n';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

enableScreens();

function AppContent() {
  const { isLoadingTheme } = useTheme();

  if (isLoadingTheme) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00adf5" />
      </View>
    );
  }
  return <AppNavigator />;
}

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [isI18nReady, setIsI18nReady] = useState(false);
  const initializeStore = useHabitStore(state => state.initialize);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initI18n();
        setIsI18nReady(true);
        await initializeDatabase();
        await initializeStore();
        console.log("Database initialized successfully!");
        await registerForPushNotificationsAsync();
        await syncPresentedNotifications();
        setIsDbReady(true);
      }
      catch (error) {
        console.error("Database initialization failed", error);
        setIsDbReady(true);
      }
    }
    setupDB();

    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      saveNotificationToHistory(notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      saveNotificationToHistory(response.notification);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    // Start auto-backup using default interval (24h).
    startAutoBackup(DEFAULT_BACKUP_INTERVAL_MS);
    return () => {
      stopAutoBackup();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <ThemeProvider>
            <CustomStatusBar />
            {!isDbReady || !fontsLoaded || !isI18nReady ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00adf5" />
              </View>
            ) : (
              <AppContent />
            )}
            <Toast />
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

