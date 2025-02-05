import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { addHabit } from "../assets/data/database"; // Import your function

const HomeScreen = () => {
  const [habitName, setHabitName] = useState("");

  const handleAddHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert("Please enter a habit name!");
      return;
    }
    try {
      await addHabit(habitName, "Health"); // Example category
      Alert.alert("Habit added successfully!");
      setHabitName(""); // Reset input field
    } catch (error) {
      console.error("Error adding habit:", error);
      Alert.alert("Failed to add habit.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Add a New Habit</Text>
      <TextInput
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 8,
        }}
        placeholder="Enter habit name..."
        value={habitName}
        onChangeText={setHabitName}
      />
      <Button title="Add Habit" onPress={handleAddHabit} />
    </View>
  );
};

export default HomeScreen;
