import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Tabs: undefined;
  HabitDetails: { habitId: number; habitName: string; habitDescription: string; icon: string };
  AddHabit: undefined;
  Categories: undefined;
  "Recycle Bin": undefined;
};

export type HabitDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "HabitDetails"
>;