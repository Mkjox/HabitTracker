import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, SafeAreaView } from "react-native";
import { Calendar } from "react-native-calendars";
import { getProgress } from "../assets/data/database";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

type HabitItem = {
  habit_name: string;
  total_progress: number;
  custom_value?: string;
};

type HabitData = {
  [date: string]: HabitItem[];
};

const { height } = Dimensions.get("window");

const ProgressScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [habitData, setHabitData] = useState<HabitData>({});
  const { isDark, theme } = useTheme();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const data = await getProgress();
      const formatted = formatProgress(data);
      setHabitData(formatted);
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const formatProgress = (data: any[]): HabitData => {
    return data.reduce((acc, item) => {
      if (!item.date || item.total_progress == null) return acc;
      const date = item.date;
      acc[date] = acc[date] || [];
      acc[date].push({
        habit_name: item.habit_name,
        total_progress: item.total_progress,
        custom_value: item.custom_value,
      });
      return acc;
    }, {} as HabitData);
  };

  const habitsForSelectedDate = habitData[selectedDate] || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Progress</Text>

        <View style={[styles.calendarCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Calendar
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: theme.colors.primary,
              },
            }}
            key={isDark ? 'dark' : 'light'}
            theme={{
              calendarBackground: 'transparent',
              dayTextColor: theme.colors.text,
              textSectionTitleColor: theme.colors.textSecondary,
              textDisabledColor: theme.colors.placeholder,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.surface,
              todayTextColor: theme.colors.primary,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.text,
              textDayFontWeight: '400',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.colors.text }]}>
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>{habitsForSelectedDate.length}</Text>
          </View>
        </View>

        <FlatList
          style={styles.list}
          data={habitsForSelectedDate}
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.icon} />
              <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                No habits completed on this day.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.habitCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.habitInfo}>
                <Text style={[styles.habitName, { color: theme.colors.text }]}>{item.habit_name}</Text>
                <Text style={[styles.habitValue, { color: theme.colors.textSecondary }]}>
                  {item.custom_value ? item.custom_value : 'Completed'}
                </Text>
              </View>
              <View style={[styles.statusIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Ionicons name="checkmark-sharp" size={18} color={theme.colors.success} />
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const getToday = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // yyyy-mm-dd
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 24,
  },
  calendarCard: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  list: {
    flex: 1,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    justifyContent: 'space-between',
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
    fontWeight: '600',
  },
  habitValue: {
    fontSize: 13,
    marginTop: 2,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 15,
    textAlign: "center",
  },
});

export default ProgressScreen;
