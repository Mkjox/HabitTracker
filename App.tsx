import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { initializeDatabase } from './src/assets/data/database';
import { startAutoBackup, stopAutoBackup, DEFAULT_BACKUP_INTERVAL_MS } from './src/assets/data/backup';
import { View, ActivityIndicator } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomStatusBar from './src/components/CustomStatusBar';

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

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initializeDatabase();
        console.log("Database initialized successfully!");
        setIsDbReady(true);
      }
      catch (error) {
        console.error("Database initialization failed", error);
        setIsDbReady(true);
      }
    }
    setupDB();
  }, []);

  useEffect(() => {
    // Start auto-backup using default interval (24h).
    startAutoBackup(DEFAULT_BACKUP_INTERVAL_MS);
    return () => {
      stopAutoBackup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <ThemeProvider>
          <CustomStatusBar />
          {!isDbReady ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#00adf5" />
            </View>
          ) : (
            <AppContent />
          )}
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

