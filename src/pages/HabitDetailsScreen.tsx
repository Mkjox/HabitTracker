import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, Platform, StatusBar, SafeAreaView } from "react-native";
import { TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp } from "@react-navigation/native";
import { addProgress, removeProgress, getProgressByHabitId } from "../assets/data/database";
import { RootStackParamList } from "../assets/types/navigationTypes";
import { useTheme } from "../context/ThemeContext";
import { Ionicons, Entypo } from "@expo/vector-icons";
import CustomButton from "../components/CustomButton";

type HabitDetailsScreenRouteProp = RouteProp<RootStackParamList, "HabitDetails">;

type ProgressItem = {
  id: number;
  date: string;
  total_progress: number;
  custom_value?: string | null;
};

const HabitDetailsScreen = ({ route }: { route: HabitDetailsScreenRouteProp }) => {
  const { habitId, habitName, habitDescription } = route.params;
  const { isDark, theme } = useTheme();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [progressHistory, setProgressHistory] = useState<ProgressItem[]>([]);
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string>("");

  useEffect(() => {
    const fetchProgress = async (): Promise<void> => {
      try {
        const data = await getProgressByHabitId(habitId);
        setProgressHistory(Array.isArray(data) ? (data as ProgressItem[]) : []);
      } catch (error) {
        console.error("Error fetching progress:", error);
        setProgressHistory([]);
      }
    };

    fetchProgress();
  }, [habitId]);

  const handleToggleProgress = async (): Promise<void> => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const alreadyCompleted = progressHistory.some((item) => item.date === formattedDate);

    try {
      if (alreadyCompleted) {
        await removeProgress(habitId, formattedDate);
      } else {
        await addProgress(habitId, 1, formattedDate, useCustom && customValue.trim() ? customValue.trim() : undefined);
      }

      const updatedData = await getProgressByHabitId(habitId);
      setProgressHistory(updatedData as ProgressItem[] ?? []);
    } catch (error) {
      console.error("Error toggling progress:", error);
    }
  };

  const isDateCompleted = (date: string): boolean => progressHistory.some((item) => item.date === date);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.habitName, { color: theme.colors.text }]}>{habitName}</Text>
          <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>{habitDescription}</Text>
        </View>

        <View style={[styles.actionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Log Progress</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
            style={[styles.datePickerButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>{selectedDate.toDateString()}</Text>
            <Entypo name="chevron-small-down" size={20} color={theme.colors.icon} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          <View style={styles.switchRow}>
            <View>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Use custom value</Text>
              <Text style={[styles.switchSublabel, { color: theme.colors.textSecondary }]}>Add units or measurements</Text>
            </View>
            <Switch
              value={useCustom}
              onValueChange={setUseCustom}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={useCustom ? theme.colors.primary : '#f4f3f4'}
            />
          </View>

          {useCustom && (
            <TextInput
              label="Progress Value (e.g., 2km, 50 pushups)"
              value={customValue}
              onChangeText={setCustomValue}
              mode="outlined"
              style={[styles.customInput, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.text}
              placeholderTextColor={theme.colors.placeholder}
            />
          )}

          <CustomButton
            onPress={handleToggleProgress}
            title={isDateCompleted(selectedDate.toISOString().split("T")[0]) ? "Remove Selection" : "Mark as Done"}
            variant={isDateCompleted(selectedDate.toISOString().split("T")[0]) ? "outline" : "primary"}
            style={{ marginTop: 10 }}
          />
        </View>

        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: theme.colors.text }]}>Progress History</Text>
          <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>{progressHistory.length}</Text>
          </View>
        </View>

        {progressHistory.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="bar-chart-outline" size={48} color={theme.colors.icon} />
            <Text style={[styles.noProgress, { color: theme.colors.textSecondary }]}>No progress recorded yet.</Text>
          </View>
        ) : (
          <FlatList
            data={progressHistory}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.historyItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyDate, { color: theme.colors.text }]}>{item.date}</Text>
                  <Text style={[styles.historyValue, { color: theme.colors.textSecondary }]}>
                    {item.custom_value && item.custom_value.trim() !== "" ? item.custom_value : "Standard completion"}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                  <Ionicons name="checkmark-done" size={16} color={theme.colors.success} />
                </View>
              </View>
            )}
          />
        )}
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
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  habitName: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  habitDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    marginHorizontal: 10,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchSublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  customInput: {
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: "600",
  },
  historyValue: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  noProgress: {
    marginTop: 12,
    fontSize: 15,
  },
});

export default HabitDetailsScreen;
