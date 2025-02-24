import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from "react-native";
import { Agenda, AgendaSchedule } from "react-native-calendars";
import { getProgress } from "../assets/data/database";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../assets/colors/colors";

const ProgressScreen = () => {
  const [progressData, setProgressData] = useState<AgendaSchedule>({});
  const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();
  
    const themeStyles = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getProgress();
        console.log("Raw progress data from DB:", data);

        const formattedData = formatProgressForCalendar(data);
        console.log("Formatted calendar data:", formattedData);

        setProgressData(formattedData);
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const formatProgressForCalendar = (progressData: any[]): AgendaSchedule => {
    return progressData.reduce((acc, item) => {
      if (!item.date || item.total_progress == null) return acc;
      const formattedDate = item.date; 
  
      acc[formattedDate] = acc[formattedDate] || [];
      acc[formattedDate].push({
        habit_name: `Habit #${item.habit_id}`, 
        total_progress: item.total_progress
      });
      return acc;
    }, {} as AgendaSchedule);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Progress</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00adf5" />
      ) : (
        <Agenda
          items={progressData}
          renderItem={(item: { habit_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; total_progress: any; }) => (
            <View style={styles.agendaItem}>
              <Text style={styles.habitName}>{item.habit_name}</Text>
              <Text>{`Progress: ${item.total_progress}%`}</Text>
            </View>
          )}
          renderEmptyData={() => (
            <View style={[styles.emptyItem, themeStyles.button]}>
              <Text style={themeStyles.buttonText}>No progress for this day</Text>
            </View>
          )}
          theme={{
            agendaDayTextColor: "purple",
            agendaDayNumColor: "purple",
            agendaTodayColor: "#00adf5",
            agendaKnobColor: "#00adf5",
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#1e1e1e",
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    // color: "#fff",
    marginVertical: 10,
  },
  agendaItem: {
    // backgroundColor: "#2a2a2a",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 17,
  },
  habitName: {
    // color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyItem: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginTop: 17,
    alignItems: "center",
  },
});

export default ProgressScreen;
