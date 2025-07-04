import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Alert,
  ToastAndroid,
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  Menu
} from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import {
  addHabit,
  getCategories,
  getHabits,
  deleteHabit
} from "../assets/data/database";
import { useTheme } from "../context/ThemeContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../assets/types/navigationTypes";
import { darkTheme, lightTheme } from "../assets/colors/colors";

type Habit = {
  id: number;
  name: string;
  description: string;
  category_id: number;
};

const { height } = Dimensions.get("window");

export default function AddHabitScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const { isDark } = useTheme();
  const themeStyles = isDark ? darkTheme : lightTheme;
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadData = useCallback(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length && selectedCat === null) setSelectedCat(cats[0].id);
    });
    getHabits().then(setHabits);
  }, [selectedCat]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const showToast = (msg: string) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  };

  const onAdd = async () => {
    if (!name.trim()) return Alert.alert("Error", "Enter a habit name.");
    if (!selectedCat) return Alert.alert("Error", "Select a category.");
    await addHabit(name, description, selectedCat);
    Keyboard.dismiss();
    showToast("Habit saved!");
    setName("");
    setDescription("");
    loadData();
  };

  const onDelete = (id: number) =>
    Alert.alert("Delete Habit?", "This can’t be undone.", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteHabit(id);
          showToast("Habit deleted");
          loadData();
        }
      }
    ]);

  return (
    <SafeAreaView style={[styles.outer, themeStyles.container]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Habit Section */}
          <Card.Content>
            <TextInput
              label="Habit Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={[styles.input, themeStyles.textInput]}
              theme={{
                colors: {
                  text: themeStyles.text.color,
                  placeholder: themeStyles.textGray.color,
                  primary: themeStyles.text.color
                }
              }}
              textColor={themeStyles.buttonText.color}
            />
            <TextInput
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={[styles.input, themeStyles.textInput, { marginBottom: height * 0.03 }]}
              theme={{
                colors: {
                  text: themeStyles.text.color,
                  placeholder: themeStyles.textGray.color,
                  primary: themeStyles.text.color
                }
              }}
              textColor={themeStyles.buttonText.color}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              contentStyle={[
                themeStyles.card,
                {
                  borderColor: '#CCCCCC',
                  borderWidth: 1,
                  marginTop: height * 0.025,
                  justifyContent: 'center'
                }]
              }
              anchor={
                <Button
                  mode="contained"
                  onPress={() => setMenuVisible(true)}
                  style={[
                    styles.input,
                    themeStyles.button
                  ]}
                  labelStyle={themeStyles.buttonText}
                >
                  {categories.find((c) => c.id === selectedCat)?.name ||
                    "Select Category"}
                </Button>
              }
            >
              {categories.map((cat) => (
                <Menu.Item
                  key={cat.id}
                  title={cat.name}
                  onPress={() => {
                    setSelectedCat(cat.id);
                    setMenuVisible(false);
                  }}
                  titleStyle={themeStyles.text}
                />
              ))}
            </Menu>
            <Button
              mode="contained"
              onPress={onAdd}
              style={[styles.addButton, themeStyles.button]}
              labelStyle={themeStyles.buttonText}
            >
              Add Habit
            </Button>
          </Card.Content>

        <Divider style={[styles.divider, themeStyles.hairLine]} />

        {/* Habits List */}
        <FlatList
          data={habits}
          keyExtractor={(h) => h.id.toString()}
          ItemSeparatorComponent={() => <Divider style={themeStyles.hairLine} />}
          contentContainerStyle={{ paddingBottom: 50 }}
          renderItem={({ item }) => {
            const catName =
              categories.find((c) => c.id === item.category_id)?.name ||
              "Uncategorized";
            return (
              <Card style={[styles.habitCard, themeStyles.card]}>
                <TouchableOpacity
                  onPress={() =>
                    nav.navigate("HabitDetails", {
                      habitId: item.id,
                      habitName: item.name,
                      habitDescription: item.description
                    })
                  }
                >
                  <Card.Title
                    title={item.name}
                    titleStyle={themeStyles.text}
                    subtitle={`Category: ${catName}`}
                    subtitleStyle={themeStyles.textGray}
                    right={() => (
                      <Entypo
                        name="trash"
                        size={20}
                        color={themeStyles.icon.color}
                        style={{ marginRight: 12 }}
                        onPress={() => onDelete(item.id)}
                      />
                    )}
                  />
                </TouchableOpacity>
              </Card>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={themeStyles.text}>
                No habits yet. Add one above!
              </Text>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    padding: 16,
    paddingTop: StatusBar.currentHeight || 20
  },
  scroll: {
    flexGrow: 1
  },
  card: {
    marginBottom: 16,
    borderRadius: 8
  },
  input: {
    marginBottom: 12
  },
  addButton: {
    marginTop: 8,
    marginBottom: height * 0.02
  },
  divider: {
    marginVertical: 16
  },
  habitCard: {
    marginVertical: 8,
    borderRadius: 8,
  },
  empty: {
    marginTop: 32,
    alignItems: "center"
  }
});
