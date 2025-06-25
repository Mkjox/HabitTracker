import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { initializeDatabase } from './src/assets/data/database';
import { View, Text, ActivityIndicator } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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


  try {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    );
  } catch (error) {
    console.error("Navigation Error", error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Navigation Error</Text>
      </View>
    );
  }
}

