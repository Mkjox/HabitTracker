import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { addCategory, getCategories } from '../assets/data/database';

const CategoriesScreen = () => {
    const [categoryName, setCategoryName] = useState("");
    const [categories, setCategories] = useState<{ id: number; name: string; created_at: string }[]>([]);

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

    return (
        <View>
            <Text>
                Categories
            </Text>

            <TextInput
                placeholder='Enter category name'
                value={categoryName}
                onChangeText={setCategoryName}
            />

            <Button title='Add Category' onPress={handleAddCategory} />

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
                    <View>
                        <Text>{item.name}</Text>
                        <Text>Created at: {item.created_at}</Text>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
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
        borderBottomWidth: 1
    },
    itemName: {
        fontSize: 16
    },
    itemDate: {
        fontSize: 12,
        color: 'gray'
    }
})

export default CategoriesScreen;