import React, { useCallback, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { fonts } from '../assets/fonts/fonts';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../assets/types/navigationTypes';
import { useTheme } from "../context/ThemeContext";
import {
  restoreHabit,
  getDeletedHabits,
  deleteHabitPermanently,
  cleanRecycleBin,
} from "../assets/data/database";
import { useFocusEffect } from "@react-navigation/native";
import CustomButton from "../components/CustomButton";
import ConfirmModal from '../components/ConfirmModal';
import { showErrorToast, showSuccessToast } from '../lib/toast';

type Habit = {
  id: number;
  name: string;
  category_id: number;
};

const RecycleBinScreen: React.FC = () => {
  const { t } = useTranslation();
  const [deletedHabits, setDeletedHabits] = useState<Habit[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      fetchDeletedHabits();
    }, [])
  );

  const fetchDeletedHabits = async (): Promise<void> => {
    try {
      const data: Habit[] = await getDeletedHabits();
      setDeletedHabits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching deleted habits:", error);
      setDeletedHabits([]);
    }
  };

  const handleRestore = async (habitId: number): Promise<void> => {
    try {
      await restoreHabit(habitId);
      fetchDeletedHabits();
    } catch (error) {
      console.error("Error restoring habit:", error);
    }
  };

  const openDeleteModal = (habit: Habit) => {
    setDeleteTarget(habit);
    setDeleteModalVisible(true);
  };

  const confirmDeletePermanently = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteHabitPermanently(deleteTarget.id);
      showSuccessToast(t('recycleBin.successDelete'), t('common.success'));
      fetchDeletedHabits();
    } catch (error) {
      console.error("Error deleting habit permanently:", error);
      showErrorToast(t('recycleBin.errDelete') ?? 'Failed to delete habit.', t('common.error'));
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setDeleteTarget(null);
    }
  };

  const handleCleanBin = (): void => {
    if (deletedHabits.length === 0) return;
    setDeleteTarget(null);
    setDeleteModalVisible(true);
  };

  const confirmCleanBin = async () => {
    setDeleteLoading(true);
    try {
      await cleanRecycleBin();
      fetchDeletedHabits();
    } catch (error) {
      console.error("Error emptying recycle bin:", error);
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('recycleBin.title')}</Text>
          {deletedHabits.length > 0 ? (
            <TouchableOpacity onPress={handleCleanBin}>
              <Ionicons name="trash-bin" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        <FlatList
          data={deletedHabits}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trash-outline" size={64} color={theme.colors.icon} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('recycleBin.emptyMsg')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.habitCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.habitInfo}>
                <Text style={[styles.habitName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.habitSub, { color: theme.colors.textSecondary }]}>{t('recycleBin.readyToRestore')}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleRestore(item.id)}
                  style={[styles.actionButton, { backgroundColor: theme.colors.success + '15' }]}
                >
                  <Ionicons name="refresh-outline" size={20} color={theme.colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openDeleteModal(item)}
                  style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        <ConfirmModal
          visible={deleteModalVisible}
          title={deleteTarget ? t('recycleBin.confirmDeleteTitle') : t('recycleBin.confirmEmptyTitle')}
          message={deleteTarget ? t('recycleBin.confirmDelete') : t('recycleBin.confirmEmpty')}
          confirmText={deleteTarget ? t('recycleBin.deleteBtn') : t('recycleBin.deleteAllBtn')}
          cancelText={t('recycleBin.cancelBtn')}
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={deleteTarget ? confirmDeletePermanently : confirmCleanBin}
          confirmButtonColor={theme.colors.error}
          loading={deleteLoading}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 20,
    marginTop: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  listContainer: {
    paddingBottom: 20,
  },
  habitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  habitSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});

export default RecycleBinScreen;
