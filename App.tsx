import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { initializeDatabase } from './src/assets/data/database';

export default function App() {
  useEffect(() => {
    const setupDB = async () => {
      try {
        await initializeDatabase();
        console.log("Database initialized successfully!");
      }
      catch (error) {
        console.error("Database initialization failed", error);
      }
    }
    setupDB();
  }, []);

  return (
    <PaperProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </PaperProvider>
  );
}

