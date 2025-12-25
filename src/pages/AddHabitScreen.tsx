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
  StatusBar,
  SafeAreaView,
  Modal
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
} from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import {
  addHabit,
  getCategories,
  getHabits,
  deleteHabit
} from "../assets/data/database";
import { useTheme } from "../context/ThemeContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../assets/types/navigationTypes";
import CustomButton from "../components/CustomButton";

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
  const [pickerVisible, setPickerVisible] = useState(false);
  const [filter, setFilter] = useState("");

  const { isDark, theme } = useTheme();
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
    <SafeAreaView style={[styles.outer, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id.toString()}
        ItemSeparatorComponent={() => <Divider style={{ backgroundColor: theme.colors.border }} />}
        contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Habit Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                textColor={theme.colors.text}
                placeholderTextColor={theme.colors.placeholder}
              />
              <TextInput
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={[styles.input, { backgroundColor: theme.colors.surface, marginBottom: 20 }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                textColor={theme.colors.text}
                placeholderTextColor={theme.colors.placeholder}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setPickerVisible(true)}
                style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Category</Text>
                <View style={styles.pickerButtonContent}>
                  <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500' }}>
                    {categories.find(c => c.id === selectedCat)?.name ?? "Select Category"}
                  </Text>
                  <Entypo name="chevron-small-down" size={24} color={theme.colors.icon} />
                </View>
              </TouchableOpacity>

              <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHeader}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text }}>Select Category</Text>
                      <TouchableOpacity onPress={() => { setPickerVisible(false); setFilter(""); }}>
                        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Done</Text>
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      placeholder="Search categories..."
                      value={filter}
                      onChangeText={setFilter}
                      mode="outlined"
                      style={[styles.searchInput, { backgroundColor: theme.colors.background }]}
                      outlineColor={theme.colors.border}
                      activeOutlineColor={theme.colors.primary}
                      textColor={theme.colors.text}
                      placeholderTextColor={theme.colors.placeholder}
                      left={<TextInput.Icon icon="magnify" color={theme.colors.icon} />}
                    />

                    <FlatList
                      data={categories.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))}
                      keyExtractor={c => c.id.toString()}
                      style={{ flex: 1 }}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => { setSelectedCat(item.id); setPickerVisible(false); setFilter(""); }}
                          style={styles.categoryItem}
                        >
                          <Text style={{ color: theme.colors.text, fontSize: 16 }}>{item.name}</Text>
                          {selectedCat === item.id && (
                            <Entypo name="check" size={20} color={theme.colors.primary} />
                          )}
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.colors.border }} />}
                    />
                  </View>
                </View>
              </Modal>

              <CustomButton
                title="Add Habit"
                style={styles.addButton}
                onPress={onAdd}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>My Habits</Text>
              <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>{habits.length}</Text>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const catName =
            categories.find((c) => c.id === item.category_id)?.name ||
            "Uncategorized";
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.habitCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() =>
                nav.navigate("HabitDetails", {
                  habitId: item.id,
                  habitName: item.name,
                  habitDescription: item.description
                })
              }
            >
              <View style={styles.habitCardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.habitName, { color: theme.colors.text }]}>{item.name}</Text>
                  <Text style={[styles.habitCategory, { color: theme.colors.textSecondary }]}>{catName}</Text>
                </View>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
                  <Entypo
                    name="trash"
                    size={18}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={48} color={theme.colors.icon} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>
              No habits yet. Add one above!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    // Combined from second block:
    // padding: 16, // This was removed as the FlatList contentContainerStyle handles padding
    // paddingTop: StatusBar.currentHeight || 20 // SafeAreaView handles this
  },
  headerContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  pickerButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    marginTop: 8,
    // Combined from second block:
    // marginBottom: height * 0.02 // This was not used in the component, keeping the first block's definition
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  habitCard: {
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Combined from second block:
    // marginVertical: 8, // First block had 6, keeping 6 as it's more specific to this component
    // borderRadius: 8, // First block had 12, keeping 12
    // marginHorizontal: 16 // First block had 20, keeping 20
  },
  habitCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
  },
  habitCategory: {
    fontSize: 13,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 16,
    height: 50,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  empty: {
    marginTop: 60, // First block had 60, second had 32. Keeping 60 as it's used in the component.
    alignItems: "center",
  },
  // Styles from the second block that were not duplicates or were new:
  scroll: {
    flexGrow: 1
  },
  card: {
    marginBottom: 16,
    borderRadius: 8
  },
  divider: { // This style is not used in the component, a direct Divider component is used
    marginVertical: 16
  },
});
