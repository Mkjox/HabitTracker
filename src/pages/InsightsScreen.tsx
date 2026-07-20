import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';
import { fonts } from '../assets/fonts/fonts';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { Calendar } from "react-native-calendars";
import {
  getMonthlyStats,
  getAllProgress,
  getGlobalStats,
  getCategoryStats,
  getHabitStreaks
} from "../assets/data/database";
import { useTheme } from "../context/ThemeContext";
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { Inter_400Regular } from '@expo-google-fonts/inter';

const { width } = Dimensions.get("window");

const InsightsScreen = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalHabits: 0, totalCompletions: 0, bestStreak: 0 });
  const [categoryStats, setCategoryStats] = useState<{ name: string; count: number }[]>([]);
  const [topHabits, setTopHabits] = useState<{ name: string; streak: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const font = useFont(Inter_400Regular, 12);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, progress, global, categories, streaks] = await Promise.all([
        getMonthlyStats(),
        getAllProgress(),
        getGlobalStats(),
        getCategoryStats(),
        getHabitStreaks()
      ]);

      // Process Monthly Chart Data (Pad to 6 months)
      const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          month_id: d.toISOString().substring(0, 7),
          month_label: d.toLocaleString('en-US', { month: 'short' }),
          total_completed: 0
        };
      });

      stats.forEach((s: any) => {
        const match = last6Months.find(m => m.month_id === s.month_id);
        if (match) match.total_completed = s.total_completed;
      });

      const formattedChart = last6Months.map(s => ({
        x: s.month_label,
        y: s.total_completed,
      }));
      setChartData(formattedChart);

      // Process Global Stats
      setGlobalStats(global);
      setCategoryStats(categories);

      // Process Marked Dates for Calendar
      const marks: any = {};
      progress.forEach((item: any) => {
        marks[item.date] = {
          marked: true,
          dotColor: theme.colors.primary,
        };
      });
      setMarkedDates(marks);

    } catch (error) {
      console.error("[Insights] Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [theme]);

  useEffect(() => {
    // initial load
    fetchData();
  }, [fetchData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Summary Row */}
        <View style={styles.statsGrid}>
          <StatCard title={t('insights.habits')} value={globalStats.totalHabits} icon="leaf" color={theme.colors.primary} />
          <StatCard title={t('insights.bestStreak')} value={`${globalStats.bestStreak}d`} icon="flame" color="#FF9500" />
          <StatCard title={t('insights.total')} value={globalStats.totalCompletions} icon="checkmark-circle" color={theme.colors.success} />
        </View>

        {/* Monthly Trend Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('insights.monthlyTrends')}</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>{t('insights.monthlyDesc')}</Text>
          <Text style={[styles.sectionStat, { color: theme.colors.text }]}>{t('insights.totalPeriod', { total: chartData.reduce((sum, d) => sum + (d.y || 0), 0) })}</Text>

          <View style={styles.chartWrapper}>
            {font && (
              <CartesianChart
                data={chartData}
                xKey="x"
                yKeys={["y"]}
                domainPadding={{ left: 50, right: 50, top: 30 }}
                axisOptions={{
                  labelColor: theme.colors.textSecondary,
                  lineColor: theme.colors.border,
                  font: font,
                  formatYLabel: (val) => `${Math.round(val)}`,
                  formatXLabel: (val) => `${val}`
                }}
              >
                {({ points, chartBounds }) => (
                  <Bar
                    points={points.y}
                    chartBounds={chartBounds}
                    color={theme.colors.primary}
                    roundedCorners={{ topLeft: 8, topRight: 8 }}
                    innerPadding={0.3}
                  />
                )}
              </CartesianChart>
            )}
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('insights.categoryDist')}</Text>
          </View>

          {categoryStats.map((cat, index) => {
            const percentage = globalStats.totalHabits > 0 ? (cat.count / globalStats.totalHabits) * 100 : 0;
            const isInvalidName = !cat.name || cat.name === 'null' || cat.name === 'undefined';
            const displayName = isInvalidName ? t('common.uncategorized', 'Uncategorized') : cat.name;

            return (
              <View key={cat.name || `cat-${index}`} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                    {displayName}
                  </Text>
                  <Text style={[styles.categoryCount, { color: theme.colors.textSecondary }]}>{t('insights.habitsCount', { count: cat.count })}</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border + '50' }]}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: theme.colors.primary }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Consistency Calendar Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('insights.consistencyMap')}</Text>
          </View>

          <Calendar
            key={i18n.language}
            markedDates={{
              ...markedDates,
              [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: theme.colors.primary }
            }}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.placeholder,
              dotColor: theme.colors.primary,
              monthTextColor: theme.colors.text,
              indicatorColor: theme.colors.primary,
              textDayFontWeight: '600',
              textMonthFontWeight: '800',
            }}
            style={styles.calendar}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.extraBold,
    marginBottom: 24,
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  sectionStat: {
    fontSize: 14,
    fontFamily: fonts.bold,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    marginLeft: 10,
  },
  chartWrapper: {
    height: 200,
    width: '100%',
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  calendar: {
    borderRadius: 12,
    marginTop: 8,
  }
});

export default InsightsScreen;
