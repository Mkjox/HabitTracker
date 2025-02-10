import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from "react-native";
import { Agenda, AgendaSchedule } from "react-native-calendars";
import { getProgress } from "../assets/data/database";

const ProgressScreen = () => {
  const [progressData, setProgressData] = useState<AgendaSchedule>({});
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Progress</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00adf5" />
      ) : (
        <Agenda
          items={progressData}
          renderItem={(item) => (
            <View style={styles.agendaItem}>
              <Text style={styles.habitName}>{item.habit_name}</Text>
              <Text>{`Progress: ${item.total_progress}%`}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const formatProgressForCalendar = (progressData: any[]): AgendaSchedule => {
  return progressData.reduce((acc, item) => {
    if (!item.date || item.total_progress == null) return acc;
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push({
      habit_name: item.habit_name, // Include habit name 
      total_progress: item.total_progress
    });
    return acc;
  }, {} as AgendaSchedule);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  top: {
    marginTop: StatusBar.currentHeight
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20
  },
  agendaItem: {
    backgroundColor: "#e3f2fd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  habitName: {
    fontWeight: "bold"
  }
});

export default ProgressScreen;
