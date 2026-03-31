import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, SafeAreaView, ScrollView } from "react-native";
import { TextInput } from "react-native-paper";
import { RouteProp } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { addProgress, removeProgress, getProgressByHabitId } from "../assets/data/database";
import { RootStackParamList } from "../assets/types/navigationTypes";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../components/CustomButton";
import { hapticFeedback } from "../lib/haptics";
import { useHabitStore } from "../store/useHabitStore";

type HabitDetailsScreenRouteProp = RouteProp<RootStackParamList, "HabitDetails">;

type ProgressItem = {
  id: number;
  date: string;
  total_progress: number;
  custom_value?: string | null;
};

const HabitDetailsScreen = ({ route }: { route: HabitDetailsScreenRouteProp }) => {
  const { habitId, habitName, habitDescription, icon = "leaf" } = route.params;
  const { theme, isDark } = useTheme();
  const toggleHabitStore = useHabitStore(state => state.toggleHabit);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [progressHistory, setProgressHistory] = useState<ProgressItem[]>([]);
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string>("");

  const fetchProgress = async (): Promise<void> => {
    try {
      const data = await getProgressByHabitId(habitId);
      setProgressHistory(Array.isArray(data) ? (data as ProgressItem[]) : []);
    } catch (error) {
      console.error("Error fetching progress:", error);
      setProgressHistory([]);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [habitId]);

  const handleToggleDate = async (date: string): Promise<void> => {
    const today = new Date().toISOString().split("T")[0];
    const alreadyCompleted = progressHistory.some((item) => item.date === date);

    try {
      if (date === today) {
        // Use global store for today's toggle to keep Dashboard in sync
        await toggleHabitStore(habitId);
      } else {
        // For historical dates, continue using direct DB logic
        if (alreadyCompleted) {
          await removeProgress(habitId, date);
          hapticFeedback.selection();
        } else {
          await addProgress(habitId, 1, date, useCustom && customValue.trim() ? customValue.trim() : undefined);
          hapticFeedback.success();
        }
      }
      await fetchProgress();
    } catch (error) {
      console.error("Error toggling progress:", error);
    }
  };

  const markedDates = useMemo(() => {
    const marked: any = {};
    
    // Mark completed days
    progressHistory.forEach(item => {
      marked[item.date] = {
        selected: true,
        selectedColor: theme.colors.success,
        selectedTextColor: '#fff',
      };
    });

    // Mark current selection in calendar
    marked[selectedDate] = {
      ...marked[selectedDate],
      marked: true,
      dotColor: theme.colors.primary,
      customStyles: {
        container: {
          borderWidth: 2,
          borderColor: theme.colors.primary,
        }
      }
    };

    return marked;
  }, [progressHistory, selectedDate, theme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name={icon as any} size={40} color={theme.colors.primary} />
          </View>
          <Text style={[styles.habitName, { color: theme.colors.text }]}>{habitName}</Text>
          <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>{habitDescription}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Progress Calendar</Text>
          <Calendar
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: theme.colors.success,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.border,
              dotColor: theme.colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.text,
              indicatorColor: theme.colors.primary,
              textDayFontWeight: '600',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
            }}
            markedDates={markedDates}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            onDayLongPress={(day: any) => handleToggleDate(day.dateString)}
          />
          <Text style={[styles.calendarHint, { color: theme.colors.textSecondary }]}>
            Tip: Long press a date to toggle completion
          </Text>
        </View>

        <View style={[styles.actionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.actionHeader}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Selected: {new Date(selectedDate).toDateString()}
            </Text>
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Add details</Text>
              <Text style={[styles.switchSublabel, { color: theme.colors.textSecondary }]}>Units or measurements</Text>
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
              label="Value (e.g., 2km, 50 pushups)"
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
            onPress={() => handleToggleDate(selectedDate)}
            title={progressHistory.some(h => h.date === selectedDate) ? "Remove Progress" : "Mark as Done"}
            variant={progressHistory.some(h => h.date === selectedDate) ? "outline" : "primary"}
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitName: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  habitDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 4,
  },
  calendarHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  actionCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
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
});

export default HabitDetailsScreen;
