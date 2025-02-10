import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Agenda } from "react-native-calendars";
import { getProgress } from "../assets/data/database";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const ProgressScreen = () => {
  const [progressData, setProgressData] = useState<{ [date: string]: { name: string; progress: number }[] }>({});

  // Fetch progress when screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchProgress = async () => {
        try {
          const data = await getProgress();
          console.log("Raw progress data from DB:", data);

          if (!Array.isArray(data) || data.length === 0) {
            console.warn("No progress data found");
            setProgressData({});
            return;
          }

          // Convert database data into calendar format
          const formattedData: { [date: string]: { name: string; progress: number }[] } = {};
          data.forEach((item) => {
            if (!item.date || !item.name || isNaN(item.total_progress)) return;

            if (!formattedData[item.date]) {
              formattedData[item.date] = [];
            }
            formattedData[item.date].push({ name: item.name, progress: Number(item.total_progress) });
          });

          console.log("Formatted calendar data:", formattedData);
          setProgressData(formattedData);
        } catch (error) {
          console.error("Error fetching progress:", error);
        }
      };

      fetchProgress();
    }, [])
  );

  return (
    <ScrollView>
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
          Habit Progress Calendar
        </Text>

        <Agenda
          items={progressData}
          renderItem={(item, isFirst) => (
            <View style={{ backgroundColor: "#f3f3f3", padding: 10, marginVertical: 5, borderRadius: 5 }}>
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              <Text>Progress: {item.progress}%</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

export default ProgressScreen;
