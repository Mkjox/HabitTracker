import React, { useEffect, useState } from "react";
import { View, Text, Button, TextInput, FlatList, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import DateTimePicker from "expo-datepicker";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { addProgress, getProgressByHabit } from "../assets/data/database";

type HabitDetailsScreenProps = {
    route: RouteProp<{ params: { habitId: number; habitName: string } }, "params">;
};

const HabitDetailsScreen: React.FC<HabitDetailsScreenProps> = ({ route }) => {
    const { habitId, habitName } = route.params;
    const [progressAmount, setProgressAmount] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [progressHistory, setProgressHistory] = useState<Array<{ id: number; date: string; total_progress: number }>>([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProgress = async () => {
            const data = await getProgressByHabit(habitId);
            console.log("Fetched Progress History:", data);
            setProgressHistory(data ?? []);
        };
        fetchProgress();
    }, [habitId]);

    const handleAddProgress = async () => {
        if (!progressAmount) return;
        const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD format
        await addProgress(habitId, parseFloat(progressAmount), formattedDate);
        setProgressAmount("");

        const updatedData = await getProgressByHabit(habitId);
        setProgressHistory(updatedData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <Text style={styles.habitName}>{habitName}</Text>

                {/* Select Date */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateText}>📅 {selectedDate.toDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={(_, date) => {
                            setShowDatePicker(false);
                            if (date) setSelectedDate(date);
                        }}
                    />
                )}

                {/* Progress Input */}
                <TextInput
                    placeholder="Enter progress (e.g. 10)"
                    keyboardType="numeric"
                    value={progressAmount}
                    onChangeText={setProgressAmount}
                    style={styles.progressInput}
                />

                <TouchableOpacity onPress={handleAddProgress} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Add Progress</Text>
                </TouchableOpacity>

                <Text style={styles.historyTitle}>Progress History:</Text>

                <FlatList
                    data={progressHistory}
                    keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                    renderItem={({ item }) => (
                        <View style={styles.historyItem}>
                            <Text style={styles.historyDate}>{item?.date ?? "Unknown Date"}</Text>
                            <Text style={styles.historyProgress}>{item?.total_progress ?? 0}%</Text>
                        </View>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    top: {
        marginTop: StatusBar.currentHeight
    },
    habitName: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20
    },
    dateButton: {
        padding: 10,
        backgroundColor: "#007bff",
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 10
    },
    dateText: {
        color: "white",
        fontSize: 16
    },
    progressInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 5,
        backgroundColor: "#fff",
        fontSize: 16
    },
    addButton: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold"
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10
    },
    historyItem: {
        backgroundColor: "#fff",
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#ddd"
    },
    historyDate: {
        fontSize: 16,
        fontWeight: "bold"
    },
    historyProgress: {
        fontSize: 16,
        color: "#007bff"
    }
});

export default HabitDetailsScreen;
