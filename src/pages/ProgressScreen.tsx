import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getProgress } from "../assets/data/database"; // Fetch progress from DB

const ProgressScreen = () => {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      const data = await getProgress();
      setProgressData(data);
    };
    fetchProgress();
  }, []);

  // Transform data for chart
  const dates = progressData.map((item) => item.date);
  const values = progressData.map((item) => item.total_progress);

  return (
    <ScrollView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Habit Progress</Text>
        <LineChart
          data={{
            labels: dates,
            datasets: [{ data: values }],
          }}
          width={Dimensions.get("window").width - 40}
          height={250}
          yAxisSuffix="%"
          chartConfig={{
            backgroundGradientFrom: "#f3f3f3",
            backgroundGradientTo: "#fff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(34, 193, 195, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={{ borderRadius: 16, marginTop: 20 }}
        />
      </View>
    </ScrollView>
  );
};

export default ProgressScreen;
