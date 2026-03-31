import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Alert,
  ToastAndroid,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import {
  Text,
  TextInput,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../assets/types/navigationTypes";
import CustomButton from "../components/CustomButton";
import { useHabitStore } from "../store/useHabitStore";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const ICONS = [
  "leaf", "fitness", "water", "book", "flame", "heart", "alarm", "moon", "briefcase", "cafe", "bicycle", "walk"
];

export default function AddHabitScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [selectedIcon, setSelectedIcon] = useState("leaf");
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { categories, addHabit: addHabitStore } = useHabitStore();

  useEffect(() => {
    if (categories.length && selectedCat === null) {
      setSelectedCat(categories[0].id);
    }
  }, [categories, selectedCat]);

  const showToast = (msg: string) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  };

  const onAdd = async () => {
    if (!name.trim()) return Alert.alert("Error", "Give your habit a name.");
    if (!selectedCat) return Alert.alert("Error", "Select a category.");
    
    setLoading(true);
    try {
      await addHabitStore(name, description, selectedCat, selectedIcon);
      Keyboard.dismiss();
      showToast("Habit added successfully! 🌿");
      nav.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to add habit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.outer, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <Text style={[styles.title, { color: theme.colors.text }]}>New Habit</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            What positive change will you start today?
          </Text>
        </Animated.View>

        {/* Name Input */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.inputSection}>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="flat"
            style={[styles.input, { backgroundColor: 'transparent' }]}
            activeUnderlineColor={theme.colors.primary}
            textColor={theme.colors.text}
            placeholder="e.g., Morning Meditation"
          />
        </Animated.View>

        {/* Icon Selection */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose an Icon</Text>
          <View style={styles.iconGrid}>
            {ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                style={[
                  styles.iconBox,
                  { 
                    backgroundColor: selectedIcon === icon ? theme.colors.primary + '20' : theme.colors.surface,
                    borderColor: selectedIcon === icon ? theme.colors.primary : theme.colors.border
                  }
                ]}
              >
                <Ionicons 
                  name={icon as any} 
                  size={24} 
                  color={selectedIcon === icon ? theme.colors.primary : theme.colors.icon} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Category Chips */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCat(cat.id)}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: selectedCat === cat.id ? theme.colors.primary : theme.colors.surface,
                    borderColor: selectedCat === cat.id ? theme.colors.primary : theme.colors.border
                  }
                ]}
              >
                <Text style={[
                  styles.chipLabel,
                  { color: selectedCat === cat.id ? '#fff' : theme.colors.textSecondary }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.inputSection}>
          <TextInput
            label="Note (optional)"
            value={description}
            onChangeText={setDescription}
            mode="flat"
            multiline
            style={[styles.input, { backgroundColor: 'transparent' }]}
            activeUnderlineColor={theme.colors.primary}
            textColor={theme.colors.text}
          />
        </Animated.View>

        {/* Create Button */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.buttonWrapper}>
          <CustomButton 
            title="Create Habit" 
            onPress={onAdd} 
            loading={loading}
            style={styles.addButton}
          />
        </Animated.View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 32,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    fontSize: 18,
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconBox: {
    width: (width - 48 - 36) / 4,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 10,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonWrapper: {
    marginTop: 16,
  },
  addButton: {
    height: 56,
    borderRadius: 28,
  }
});
