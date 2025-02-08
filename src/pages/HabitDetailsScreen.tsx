import React, { useEffect, useState } from "react";
import { View, Text, Button, TextInput, FlatList, StyleSheet, StatusBar } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { addProgress, getProgressByHabit } from '../assets/data/database';

type HabitDetailsScreenProps = {
    route: RouteProp<{ params: { habitId: number; habitName: string } }, "params">;
};

const HabitDetailsScreen: React.FC<HabitDetailsScreenProps> = ({ route }) => {
    const { habitId, habitName } = route.params;
    const [progressAmount, setProgressAmount] = useState("");
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
        await addProgress(habitId, parseFloat(progressAmount));
        setProgressAmount("");

        const updatedData = await getProgressByHabit(habitId);
        setProgressHistory(updatedData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.top}>

                <Text style={styles.habitName}>
                    {habitName}
                </Text>

                <TextInput
                    placeholder="Enter progress (e.g. 10)"
                    keyboardType="numeric"
                    value={progressAmount}
                    onChangeText={setProgressAmount}
                    style={styles.progressInput}
                />
                <Button
                    title="Add Progress"
                    onPress={handleAddProgress}
                />

                <Text style={styles.historyTitle}>
                    Progress History:
                </Text>

                <FlatList
                    data={progressHistory}
                    keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                    renderItem={({ item }) => (
                        <Text>
                            {item?.date ?? "Unknown Date"}: {item?.total_progress ?? 0}%
                        </Text>
                    )}
                />

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    top: {
        marginTop: StatusBar.currentHeight
    },
    habitName: {
        fontSize: 20,
        fontWeight: "bold"
    },
    progressInput: {
        borderWidth: 1,
        padding: 10,
        marginVertical: 10
    },
    historyTitle: {
        marginTop: 20,
        fontSize: 18
    }
})

export default HabitDetailsScreen;