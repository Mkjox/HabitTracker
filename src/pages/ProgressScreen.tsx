import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, StatusBar, Dimensions } from "react-native";
import { Calendar } from "react-native-calendars";
import { getProgress } from "../assets/data/database";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../assets/colors/colors";

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
  const { isDark } = useTheme();
  const themeStyles = isDark ? darkTheme : lightTheme;

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
    <View style={[styles.container, themeStyles.container]}>
      <View style={styles.top}>
        <Text style={[styles.title, themeStyles.text]}>Habit Progress</Text>

        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          style={{
            borderRadius: 8,
            padding: 8,
            backgroundColor: themeStyles.container.backgroundColor,
            elevation: 2,
            marginBottom: 16,
          }}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "#00adf5",
            },
          }}
          theme={{
            calendarBackground: themeStyles.container.backgroundColor,
            dayTextColor: isDark ? '#e0e0e0' : '#2d4150',
            textSectionTitleColor: isDark ? '#888888' : '#b6c1cd',
            textDisabledColor: isDark ? '#555555' : '#d9e1e8',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00adf5',
            arrowColor: isDark ? '#ffffff' : '#000000',
            monthTextColor: isDark ? '#ffffff' : '#333333',
          }}
        />

        <FlatList
          style={styles.list}
          data={habitsForSelectedDate}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <Text style={[styles.noDataText, themeStyles.text]}>
              No habits for this day.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.habitCard, themeStyles.card]}>
              <Text style={[styles.habitName, themeStyles.text]}>{item.habit_name}</Text>
              <Text style={themeStyles.text}>
                {item.custom_value
                  ? `Done (${item.custom_value})`
                  : `Done`}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const getToday = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // yyyy-mm-dd
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  top: {
    marginTop: height * 0.01
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  list: {
    marginTop: 15,
  },
  habitCard: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  habitName: {
    fontWeight: "600",
    fontSize: 16,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default ProgressScreen;
