import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, StatusBar } from "react-native";
import { restoreHabit, getDeletedHabits, deleteHabitPermanently, cleanRecycleBin } from "../assets/data/database";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../assets/colors/colors";

const RecycleBinScreen = () => {
  const [deletedHabits, setDeletedHabits] = useState([]);
  const { isDark } = useTheme();

  const themeStyles = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    fetchDeletedHabits();
  }, []);

  const fetchDeletedHabits = async () => {
    const data = await getDeletedHabits();
    console.log("Deleted habits:", data);
    setDeletedHabits(data);
  };

  const handleRestore = async (habitId: number) => {
    await restoreHabit(habitId);
    fetchDeletedHabits();
  };

  const handleDeletePermanently = async (habitId: number) => {
    Alert.alert("Confirm Delete", "Are you sure you want to permanently delete this habit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteHabitPermanently(habitId);
          fetchDeletedHabits();
        },
      },
    ]);
  };

  // const handleCleanRecycleBin = async () => {
  //   Alert.alert("Empty Recycle Bin", "This will delete all habits permanently. Proceed?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Empty Bin",
  //       onPress: async () => {
  //         await cleanRecycleBin();
  //         fetchDeletedHabits();
  //       },
  //     },
  //   ]);
  // };

  const handleRefresh = () => {
    fetchDeletedHabits();
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>Recycle Bin</Text>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="blue" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>

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
    fontWeight: 'bold',
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
