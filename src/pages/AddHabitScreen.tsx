import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Alert, StyleSheet, StatusBar, FlatList, TouchableOpacity, Dimensions, ToastAndroid, Platform, Keyboard, ScrollView } from "react-native";
import { Button, Divider, Menu } from "react-native-paper";
import { addHabit, getCategories, getHabits, deleteHabit } from "../assets/data/database";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from '../assets/colors/colors';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../assets/types/navigationTypes";

const { height, width } = Dimensions.get("window");

const AddHabitScreen = () => {
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string; }[]>([]);
  const [habits, setHabits] = useState<{ id: number; name: string; description: string; category_id: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const { isDark } = useTheme();

  const themeStyles = isDark ? darkTheme : lightTheme;

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      fetchHabits();
    }, [])
  );

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0) setSelectedCategory(data[0].id);
    }
    catch (error) {
      console.error("Failed to fetch categories:", error);
      console.log("Could not load categories.");
    }
  };

  const showToastAdd = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show("Habit saved successfully!", ToastAndroid.SHORT);
    }
  };

  const showToastDelete = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show("Habit deleted successfully!", ToastAndroid.SHORT);
    }
  };

  const fetchHabits = async () => {
    try {
      const data = await getHabits();
      setHabits(data);
    }
    catch (error) {
      console.error("Failed to fetch habits:", error);
      console.log("Could not load habits.");
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
      await addHabit(habitName, habitDescription, selectedCategory);
      Keyboard.dismiss();
      // Alert.alert("Success", "Habit added successfully!");
      showToastAdd();
      setHabitName("");
      setHabitDescription("");
      fetchHabits();
    }

    catch (error) {
      console.error("Error adding habit:", error);
      Alert.alert("Error", "Failed to add habit.");
    }
  };

  const handleDeleteHabit = async (id: number) => {
    Alert.alert(
      "Detele Habit",
      "Are you sure you want to delete this habit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await deleteHabit(id);
            showToastDelete();
            fetchHabits();
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={[styles.container, themeStyles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Text style={[styles.habitAddTitle, themeStyles.text]}>
            Add a New Habit
          </Text>

          <TextInput
            placeholder="Enter habit name..."
            value={habitName}
            onChangeText={setHabitName}
            style={[styles.habitAddInput, { marginTop: 15 }, themeStyles.textInput]}
          />

          <TextInput
            placeholder="Enter habit description..."
            value={habitDescription}
            onChangeText={setHabitDescription}
            style={[styles.habitAddInput, { marginBottom: 15 }, themeStyles.textInput]}
            maxLength={250}
            multiline
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

          <Button mode="contained" onPress={handleAddHabit} style={[{ marginTop: 10 }, themeStyles.button]}>
            Add Habit
          </Button>

          <Text style={[styles.habitTitle, themeStyles.text]}>
            Added Habits:
          </Text>

          <FlatList
            data={habits}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const categoryName = categories.find(c => c.id === item.category_id)?.name || "Unknown Category";
              return (
                <TouchableOpacity onPress={
                  () => navigation.navigate('HabitDetails',
                    {
                      habitId: item.id,
                      habitName: item.name,
                      habitDescription: item.description
                    })
                }>
                  <View style={[{ flexDirection: 'row', justifyContent: 'space-between' }, themeStyles.hairLine]}>
                    <View style={styles.habitWrapper}>
                      <Text style={[styles.habitName, themeStyles.text]}>{item.name}</Text>
                      <Text style={[styles.habitCategory, themeStyles.textGray]}>Category: {categoryName}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteHabit(item.id)}>
                      <Entypo name="cross" size={16} style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )
            }}
          />

        </View>
      </ScrollView>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    overflow: 'hidden'
  },
  top: {
    marginTop: height * 0.01
  },
  habitAddTitle: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  habitAddInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20
  },
  habitWrapper: {
    padding: 10,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600'
  },
  habitCategory: {
    fontSize: 14,
  },
  icon: {

  },
  iconButton: {
    justifyContent: 'center',
    marginRight: 15
  }
})

export default AddHabitScreen;
