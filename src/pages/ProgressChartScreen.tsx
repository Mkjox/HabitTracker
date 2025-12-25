import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, Dimensions } from "react-native";
import { BarGroup, CartesianChart } from "victory-native";
import { getProgress } from "../assets/data/database";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const ProgressChartScreen = () => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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

    const result = Object.keys(map).map((month) => ({
      x: month,
      y: map[month],
    }));

    return result.length > 0 ? result : [{ x: 'Jan', y: 0 }];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Monthly Progress</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <CartesianChart data={progressData} xKey="x" yKeys={["y", "z"]}>
              {({ points, chartBounds }) => (
                <BarGroup
                  chartBounds={chartBounds}
                  roundedCorners={{ topLeft: 10, topRight: 10 }}
                  betweenGroupPadding={0.3}
                >
                  <BarGroup.Bar points={points.y} color={theme.colors.primary} />
                  <BarGroup.Bar points={points.z} color={theme.colors.secondary} />
                </BarGroup>
              )}
            </CartesianChart>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Insights</Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Your monthly progress is visualized above. Each bar represents the total number of habits completed in that month.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 24,
  },
  chartContainer: {
    height: 350,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  infoCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ProgressChartScreen;
