import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  HabitDetails: { habitId: number; habitName: string, habitDescription: string };
};

export type HabitDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "HabitDetails"
>;