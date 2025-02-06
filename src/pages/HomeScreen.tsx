import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, StyleSheet, StatusBar } from "react-native";
import { Button, Divider, Menu } from "react-native-paper";
import { addHabit, getCategories } from "../assets/data/database";

const HomeScreen = () => {
  const [habitName, setHabitName] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string; }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].id);
      }
      catch (error) {
        console.error("Failed to fetch categories:", error);
        Alert.alert("Error", "Could not load categories.");
      }
    };
    fetchCategories();
  }, []);

  const handleAddHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert("Error", "Please enter a habit name.");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category.");
      return;
    }

    try {
      await addHabit(habitName, selectedCategory);
      Alert.alert("Success", "Habit added successfully!");
      setHabitName("");
    }

    catch (error) {
      console.error("Error adding habit:", error);
      Alert.alert("Error", "Failed to add habit.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text>
          Add a New Habit
        </Text>

        <TextInput
          placeholder="Enter habit name..."
          value={habitName}
          onChangeText={setHabitName}
        />

        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setVisible(true)}>
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Select Category"}
            </Button>
          }
        >
          {categories.map((cat) => (
            <Menu.Item
              key={cat.id}
              onPress={() => {
                setSelectedCategory(cat.id);
                setVisible(false);
              }}
              title={cat.name}
            />
          ))}
          <Divider />
        </Menu>

        <Button mode="contained" onPress={handleAddHabit} style={{ marginTop: 10 }}>
          Add Habit
        </Button>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10
  },
  top: {
    marginTop: StatusBar.currentHeight
  }
})

export default HomeScreen;
