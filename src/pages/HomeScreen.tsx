import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, StyleSheet, StatusBar, FlatList, TouchableOpacity } from "react-native";
import { Button, Divider, Menu } from "react-native-paper";
import { addHabit, getCategories, getHabits } from "../assets/data/database";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const [habitName, setHabitName] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string; }[]>([]);
  const [habits, setHabits] = useState<{ id: number; name: string; category_id: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
    fetchHabits();
  }, []);

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

  const fetchHabits = async () => {
    try {
      const data = await getHabits();
      setHabits(data);
    }
    catch (error) {
      console.error("Failed to fetch habits:", error);
      Alert.alert("Error", "Could not load habits.");
    }
  };

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
      fetchHabits();
    }

    catch (error) {
      console.error("Error adding habit:", error);
      Alert.alert("Error", "Failed to add habit.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.habitAddTitle}>
          Add a New Habit
        </Text>

        <TextInput
          placeholder="Enter habit name..."
          value={habitName}
          onChangeText={setHabitName}
          style={styles.habitAddInput}
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

        <Text style={styles.habitTitle}>
          Added Habits:
        </Text>

        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const categoryName = categories.find(c => c.id === item.category_id)?.name || "Unknown Category";
            return (
              <TouchableOpacity onPress={() => navigation.navigate("HabitDetails", {habitId: item.id, habitName: item.name})}>
                <View style={styles.habitWrapper}>
                  <Text style={styles.habitName}>{item.name}</Text>
                  <Text style={styles.habitCategory}>Category: {categoryName}</Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />

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
  },
  habitAddTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  habitAddInput: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20
  },
  habitWrapper: {
    padding: 10,
    borderBottomWidth: 1
  },
  habitName: {
    fontSize: 16,
  },
  habitCategory: {
    fontSize: 14,
    color: 'gray'
  }
})

export default HomeScreen;
