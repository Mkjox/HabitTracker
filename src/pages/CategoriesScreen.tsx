import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, StyleSheet, StatusBar, TouchableOpacity, Keyboard, Platform, ToastAndroid, Dimensions } from 'react-native';
import { addCategory, deleteCategory, getCategories } from '../assets/data/database';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from "../assets/colors/colors";
import { Entypo } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

const {height} = Dimensions.get("window");

const CategoriesScreen = () => {
    const [categoryName, setCategoryName] = useState("");
    const [categories, setCategories] = useState<{ id: number; name: string; created_at: string }[]>([]);
    const { isDark } = useTheme();

    const themeStyles = isDark ? darkTheme : lightTheme;

    useEffect(() => {
        fetchCategories();
    }, []);

    const showToastAdd = () => {
        if (Platform.OS === 'android') {
            ToastAndroid.show("Category saved successfully!", ToastAndroid.SHORT);
        }
    };

    const showToastDelete = () => {
        if (Platform.OS === 'android') {
            ToastAndroid.show("Category deleted successfully!", ToastAndroid.SHORT);
        }
    };

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
            Keyboard.dismiss();
            showToastAdd();
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
                        showToastDelete();
                        fetchCategories();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <View style={[styles.container, themeStyles.container]}>
            <View style={styles.top}>
                <Text style={[styles.title, themeStyles.text]}>
                    Categories
                </Text>

                <TextInput
                    placeholder='Enter category name'
                    value={categoryName}
                    onChangeText={setCategoryName}
                    style={[styles.textInput, themeStyles.textInput]}
                />

                <Button mode='contained' onPress={handleAddCategory} style={[themeStyles.button, { marginBottom: 10 }]}>
                    Add Category
                </Button>

                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.listWrapper}>
                            <View style={styles.list}>
                                <Text style={[styles.itemName, themeStyles.text]}>{item.name}</Text>
                                <Text style={[styles.itemDate, themeStyles.textGray]}>Created at: {item.created_at}</Text>
                            </View>
                            <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteCategory(item.id)}>
                                <Entypo name='cross' size={16} />
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
        padding: 20
    },
    top: {
        marginTop: height * 0.01
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5
    },
    listWrapper: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        justifyContent: 'space-between'
    },
    list: {
        padding: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600'
    },
    itemDate: {
        fontSize: 12,
        color: 'gray'
    },
    iconButton: {
        justifyContent: 'center',
        marginRight: 15
    },
})

export default CategoriesScreen;