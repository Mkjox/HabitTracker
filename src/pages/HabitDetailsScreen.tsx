import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, Platform, StatusBar, SafeAreaView } from "react-native";
import { TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp } from "@react-navigation/native";
import { addProgress, removeProgress, getProgressByHabitId } from "../assets/data/database";
import { RootStackParamList } from "../assets/types/navigationTypes";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../assets/colors/colors";

type HabitDetailsScreenRouteProp = RouteProp<RootStackParamList, "HabitDetails">;

type ProgressItem = {
  id: number;
  date: string;
  total_progress: number;
  custom_value?: string | null;
};

const HabitDetailsScreen = ({ route }: { route: HabitDetailsScreenRouteProp }) => {
  const { habitId, habitName, habitDescription } = route.params;
  const { isDark } = useTheme();

  const themeStyles = isDark ? darkTheme : lightTheme;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [progressHistory, setProgressHistory] = useState<ProgressItem[]>([]);
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string>("");

  useEffect(() => {
    const fetchProgress = async (): Promise<void> => {
      try {
        const data = await getProgressByHabitId(habitId);
        console.log(habitDescription)
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
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <Text style={[styles.habitName, themeStyles.text]}>{habitName}</Text>
      <Text style={[styles.habitDescription, themeStyles.textGray]}>{habitDescription}</Text>

      {/* Date picker button */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>📅 {selectedDate.toDateString()}</Text>
      </TouchableOpacity>

      {/* Date picker */}
      {showDatePicker && (
        Platform.OS === "ios" ? (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )
      )}

      {/* Custom Progress Toggle */}
      <View style={styles.customContainer}>
        <Text style={[styles.customLabel, themeStyles.text]}>Custom Progress:</Text>
        <Switch value={useCustom} onValueChange={setUseCustom} />
      </View>
      {useCustom && (
        <TextInput
        label="Enter custom progress (e.g., 2 km, 10 reps)"
        value={customValue}
        onChangeText={setCustomValue}
        mode="outlined"
        style={[styles.customInput, themeStyles.textInput]}
          theme={{
            colors: {
              text: themeStyles.text.color,
              placeholder: themeStyles.textGray.color,
              primary: themeStyles.text.color
            }
          }}
          textColor={themeStyles.buttonText.color}
        />
      )}

      {/* Toggle progress button */}
      <TouchableOpacity onPress={handleToggleProgress} style={[styles.toggleButton, themeStyles.button]}>
        <Text style={styles.toggleButtonText}>
          {isDateCompleted(selectedDate.toISOString().split("T")[0])
            ? `✔️ ${progressHistory.find(item => item.date === selectedDate.toISOString().split("T")[0])?.custom_value
              ? `Done (${progressHistory.find(item => item.date === selectedDate.toISOString().split("T")[0])?.custom_value})`
              : "Done"}`
            : "➕ Mark as Done"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.historyTitle, themeStyles.text]}>Progress History:</Text>

      {/* FlatList to render progress history */}
      {progressHistory.length === 0 ? (
        <Text style={[styles.noProgress, themeStyles.text]}>No progress recorded for this habit.</Text>
      ) : (
        <FlatList
          data={progressHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.historyItem, themeStyles.card]}>
              <Text style={[styles.historyDate, themeStyles.text]}>{item.date}</Text>
              <Text style={[styles.historyProgress, themeStyles.text]}>
                {item.custom_value && item.custom_value.trim() !== ""
                  ? `✔️ Done (${item.custom_value})`
                  : "✔️ Done"}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
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
    marginBottom: 10,
    marginTop: StatusBar.currentHeight
  },
  habitDescription: {
    fontSize: 16,
    fontWeight: 'semibold',
    textAlign: 'center',
    marginBottom: 15,
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
  customContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  customLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  customInput: {
    marginBottom: 10,
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
