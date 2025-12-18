import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from "react-native";
import { BarGroup, CartesianChart, Line } from "victory-native";
import { getProgress } from "../assets/data/database";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../assets/colors/colors";

const ProgressChartScreen = () => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const themeStyles = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProgress();
        const formatted = formatData(data);
        setProgressData(formatted);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatData = (data: any[]) => {
    const map: { [month: string]: number } = {};

    data.forEach((item) => {
      const month = new Date(item.date).toLocaleString("default", { month: "short" });
      map[month] = (map[month] || 0) + (item.total_progress || 0);
    });

    return Object.keys(map).map((month) => ({
      x: month,
      y: map[month],
    }));
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.text]}>Monthly Habit Progress</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#00adf5" />
      ) : (
        <CartesianChart data={progressData} xKey="x" yKeys={["y", "z"]}>
          {({ points, chartBounds }) => (
            <BarGroup
              chartBounds={chartBounds}
              roundedCorners={{ topLeft: 10, topRight: 10 }}
              betweenGroupPadding={0.3}
              withinGroupPadding={0.1}
            >
                <BarGroup.Bar points={points.y} />
                <BarGroup.Bar points={points.z} />
            </BarGroup>
          )}
        </CartesianChart>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default ProgressChartScreen;
