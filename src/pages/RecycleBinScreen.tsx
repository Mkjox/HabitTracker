import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { restoreHabit, getDeletedHabits, deleteHabitPermanently, cleanRecycleBin,  } from "../assets/data/database";
import { Ionicons } from "@expo/vector-icons";

const RecycleBinScreen = () => {
  const [deletedHabits, setDeletedHabits] = useState([]);

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
      { text: "Delete", onPress: async () => {
        await deleteHabitPermanently(habitId);
        fetchDeletedHabits();
      }},
    ]);
  };

  const handleCleanRecycleBin = async () => {
    Alert.alert("Empty Recycle Bin", "This will delete all habits permanently. Proceed?", [
      { text: "Cancel", style: "cancel" },
      { text: "Empty Bin", onPress: async () => {
        await cleanRecycleBin();
        fetchDeletedHabits();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recycle Bin</Text>

      {deletedHabits.length === 0 ? (
        <Text style={styles.emptyText}>No deleted habits.</Text>
      ) : (
        <FlatList
          data={deletedHabits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.habitItem}>
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

      {deletedHabits.length > 0 && (
        <TouchableOpacity style={styles.cleanButton} onPress={handleCleanRecycleBin}>
          <Text style={styles.cleanButtonText}>Empty Recycle Bin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
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
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  habitName: {
    fontSize: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 15,
  },
  cleanButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  cleanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RecycleBinScreen;
