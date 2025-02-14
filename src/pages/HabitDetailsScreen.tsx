import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "expo-datepicker";
import { RouteProp } from "@react-navigation/native";
import { addProgress, removeProgress, getProgressByHabitId } from "../assets/data/database";

type HabitDetailsScreenProps = {
  route: RouteProp<{ params: { habitId: number; habitName: string } }, "params">;
};

const HabitDetailsScreen: React.FC<HabitDetailsScreenProps> = ({ route }) => {
  const { habitId, habitName } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [progressHistory, setProgressHistory] = useState<
    Array<{ id: number; date: string; total_progress: number }>
  >([]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getProgressByHabitId(habitId);
        console.log("Fetched Progress History:", data);
        setProgressHistory(data ?? []);
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    };

    fetchProgress();
  }, [habitId]);

  const handleToggleProgress = async () => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const alreadyCompleted = progressHistory.some(
      (item) => item.date === formattedDate
    );

    if (alreadyCompleted) {
      await removeProgress(habitId, formattedDate);
    } else {
      await addProgress(habitId, 1, formattedDate); // Using 1 to mark completion
    }

    const updatedData = await getProgressByHabitId(habitId);
    setProgressHistory(updatedData);
  };

  const isDateCompleted = (date: string) => {
    return progressHistory.some((item) => item.date === date);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.habitName}>{habitName}</Text>

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>📅 {selectedDate.toDateString()}</Text>
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

      <TouchableOpacity onPress={handleToggleProgress} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>
          {isDateCompleted(selectedDate.toISOString().split("T")[0]) ? "✔️ Completed" : "➕ Mark as Done"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.historyTitle}>Progress History:</Text>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    paddingTop: StatusBar.currentHeight || 0,
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
});

export default HabitDetailsScreen;
