import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ToastAndroid,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import {
  restoreHabit,
  getDeletedHabits,
  deleteHabitPermanently,
  cleanRecycleBin,
} from "../assets/data/database";
import { useFocusEffect } from "@react-navigation/native";
import CustomButton from "../components/CustomButton";

type Habit = {
  id: number;
  name: string;
  category_id: number;
};

const RecycleBinScreen: React.FC = () => {
  const [deletedHabits, setDeletedHabits] = useState<Habit[]>([]);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      fetchDeletedHabits();
    }, [])
  );

  const showToastDelete = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show("Habit deleted permanently", ToastAndroid.SHORT);
    }
  };

  const fetchDeletedHabits = async (): Promise<void> => {
    try {
      const data: Habit[] = await getDeletedHabits();
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
        style: "destructive",
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

  const handleCleanBin = (): void => {
    if (deletedHabits.length === 0) return;
    Alert.alert("Empty Bin", "This will permanently delete all items. Proceed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: async () => {
          await cleanRecycleBin();
          fetchDeletedHabits();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Recycle Bin</Text>
          {deletedHabits.length > 0 && (
            <TouchableOpacity onPress={handleCleanBin}>
              <Text style={{ color: theme.colors.error, fontWeight: '600' }}>Empty Bin</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={deletedHabits}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trash-outline" size={64} color={theme.colors.icon} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Recycle bin is empty. Deleted habits will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.habitCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.habitInfo}>
                <Text style={[styles.habitName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.habitSub, { color: theme.colors.textSecondary }]}>Ready to restore</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleRestore(item.id)}
                  style={[styles.actionButton, { backgroundColor: theme.colors.success + '15' }]}
                >
                  <Ionicons name="refresh-outline" size={20} color={theme.colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePermanently(item.id)}
                  style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  listContainer: {
    paddingBottom: 20,
  },
  habitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "600",
  },
  habitSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});

export default RecycleBinScreen;
