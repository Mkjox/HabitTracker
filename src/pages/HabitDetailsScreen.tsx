import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "expo-datepicker";
import { RouteProp } from "@react-navigation/native";
import { addProgress, removeProgress, getProgressByHabitId } from "../assets/data/database";
import { RootStackParamList } from "../assets/types/navigationTypes";

type HabitDetailsScreenRouteProp = RouteProp<RootStackParamList, "HabitDetails">;

type ProgressItem = {
  id: number;
  date: string;
  total_progress: number;
};

const HabitDetailsScreen = ({ route }: { route: HabitDetailsScreenRouteProp }) => {
  const { habitId, habitName } = route.params;

  // States with appropriate types
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [progressHistory, setProgressHistory] = useState<ProgressItem[]>([]);

  useEffect(() => {
    const fetchProgress = async (): Promise<void> => {
      try {
        const data = await getProgressByHabitId(habitId);
        setProgressHistory(Array.isArray(data) ? data : []);
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
        await addProgress(habitId, 1, formattedDate);
      }

      const updatedData = await getProgressByHabitId(habitId);
      setProgressHistory(updatedData ?? []);
    } catch (error) {
      console.error("Error toggling progress:", error);
    }
  };

  const isDateCompleted = (date: string): boolean => progressHistory.some((item) => item.date === date);

  return (
    <View style={styles.container}>
      <Text style={styles.habitName}>{habitName}</Text>

      {/* Date picker button */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>📅 {selectedDate.toDateString()}</Text>
      </TouchableOpacity>

      {/* Date picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(_: any, date: Date | undefined) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Toggle progress button */}
      <TouchableOpacity onPress={handleToggleProgress} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>
          {isDateCompleted(selectedDate.toISOString().split("T")[0])
            ? "✔️ Completed"
            : "➕ Mark as Done"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.historyTitle}>Progress History:</Text>

      {/* FlatList to render progress history */}
      {progressHistory.length === 0 ? (
        <Text style={styles.noProgress}>No progress recorded for this habit.</Text>
      ) : (
        <FlatList
          data={progressHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyProgress}>
                {isDateCompleted(item.date) ? "✔️" : "❌"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  habitName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    color: "white",
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  toggleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  historyProgress: {
    fontSize: 16,
    color: "#28a745",
  },
  noProgress: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default HabitDetailsScreen;
