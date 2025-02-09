import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { addCategory, deleteCategory, getCategories } from '../assets/data/database';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from "../assets/colors/colors";
import { Entypo } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';

const CategoriesScreen = () => {
    const [categoryName, setCategoryName] = useState("");
    const [categories, setCategories] = useState<{ id: number; name: string; created_at: string }[]>([]);
    const { isDark } = useTheme();

    const themeStyles = isDark ? darkTheme : lightTheme;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        }
        catch (error) {
            Alert.alert("Error", "Failed to load categories");
        }
    };

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert("Error", "Category name cannot be empty!");
            return;
        }
        try {
            await addCategory(categoryName);
            setCategoryName("");
            fetchCategories();
        }
        catch (error) {
            Alert.alert("Error", "Category already exists or cannot be added.");
        }
    };

    const handleDeleteCategory = async (id: number) => {
        Alert.alert(
            "Detele Habit",
            "Are you sure you want to delete this habit?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        await deleteCategory(id);
                        fetchCategories();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <Text style={styles.title}>
                    Categories
                </Text>

                <TextInput
                    placeholder='Enter category name'
                    value={categoryName}
                    onChangeText={setCategoryName}
                    style={styles.textInput}
                />

                <Button title='Add Category' onPress={handleAddCategory} />

                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, justifyContent: 'space-between' }}>
                            <View style={styles.list}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDate}>Created at: {item.created_at}</Text>
                            </View>
                            <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteCategory(item.id)}>
                                <Entypo name='cross' size={16} style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10
    },
    top: {
        marginTop: StatusBar.currentHeight
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    textInput: {
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        borderRadius: 5
    },
    list: {
        padding: 10,
        // borderBottomWidth: 1
    },
    itemName: {
        fontSize: 16
    },
    itemDate: {
        fontSize: 12,
        color: 'gray'
    },
    iconButton: {
        justifyContent: 'center',
        marginRight: 15
    }
})

export default CategoriesScreen;