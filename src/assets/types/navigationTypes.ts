import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Tabs: undefined;
  HabitDetails: { 
    habitId: number; 
    habitName: string; 
    habitDescription: string; 
    icon: string;
    frequencyType: 'daily' | 'weekly' | 'custom';
    frequencyValue: number;
  };
  AddHabit: undefined;
  Categories: undefined;
  "Recycle Bin": undefined;
  Notifications: undefined;
};

export type HabitDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "HabitDetails"
>;