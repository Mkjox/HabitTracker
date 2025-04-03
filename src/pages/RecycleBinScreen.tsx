import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
  ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../assets/colors/colors";
import {
  restoreHabit,
  getDeletedHabits,
  deleteHabitPermanently,
  cleanRecycleBin,
} from "../assets/data/database";
import { useFocusEffect } from "@react-navigation/native";

// Type definition for a deleted habit
type Habit = {
  id: number;
  name: string;
  category_id: number;
};

const RecycleBinScreen: React.FC = () => {
  const [deletedHabits, setDeletedHabits] = useState<Habit[]>([]);
  const { isDark } = useTheme();
  const themeStyles = isDark ? darkTheme : lightTheme;

  useFocusEffect(
    useCallback(() => {
      fetchDeletedHabits();
    }, [])
  );

      const showToastDelete = () => {
          if (Platform.OS === 'android') {
              ToastAndroid.show("Habit deleted from Recycle Bin successfully!", ToastAndroid.SHORT);
          }
      };

  const fetchDeletedHabits = async (): Promise<void> => {
    try {
      const data: Habit[] = await getDeletedHabits();
      console.log("Deleted habits:", data);
      setDeletedHabits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching deleted habits:", error);
      setDeletedHabits([]);
    }
  };

  const handleRestore = async (habitId: number): Promise<void> => {
    try {
      await restoreHabit(habitId);
      fetchDeletedHabits();
    } catch (error) {
      console.error("Error restoring habit:", error);
    }
  };

  const handleDeletePermanently = (habitId: number): void => {
    Alert.alert("Confirm Delete", "Are you sure you want to permanently delete this habit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteHabitPermanently(habitId);
            showToastDelete();
            fetchDeletedHabits();
          } catch (error) {
            console.error("Error deleting habit permanently:", error);
          }
        },
      },
    ]);
  };

  // Uncomment if you want to add "Empty Recycle Bin" functionality
  // const handleCleanRecycleBin = async (): Promise<void> => {
  //   Alert.alert("Empty Recycle Bin", "This will delete all habits permanently. Proceed?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Empty Bin",
  //       onPress: async () => {
  //         try {
  //           await cleanRecycleBin();
  //           fetchDeletedHabits();
  //         } catch (error) {
  //           console.error("Error cleaning recycle bin:", error);
  //         }
  //       },
  //     },
  //   ]);
  // };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>Recycle Bin</Text>

        {deletedHabits.length === 0 ? (
          <Text style={styles.emptyText}>No deleted habits.</Text>
        ) : (
          <FlatList
            data={deletedHabits}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.habitItem, themeStyles.hairLine]}>
                <Text style={styles.habitName}>{item.name}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleRestore(item.id)}>
                    <Ionicons name="refresh-circle" size={24} color="green" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePermanently(item.id)}>
                    <Ionicons name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {/* Uncomment if "Empty Recycle Bin" button is needed */}
        {/* {deletedHabits.length > 0 && (
          <TouchableOpacity style={[styles.cleanButton, themeStyles.button]} onPress={handleCleanRecycleBin}>
            <Text style={[styles.cleanButtonText,themeStyles.buttonText]}>Empty Recycle Bin</Text>
          </TouchableOpacity>
        )} */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  top: {
    marginTop: StatusBar.currentHeight,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  habitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  habitName: {
    fontSize: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 15,
  },
  cleanButton: {
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  cleanButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  refreshButtonText: {
    color: "blue",
    marginLeft: 5,
  },
});

export default RecycleBinScreen;
