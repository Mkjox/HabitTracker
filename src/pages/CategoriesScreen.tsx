import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity, Keyboard, Platform, ToastAndroid, Dimensions, SafeAreaView } from 'react-native';
import { addCategory, deleteCategory, getCategories } from '../assets/data/database';
import { useTheme } from '../context/ThemeContext';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { Divider, TextInput } from 'react-native-paper';
import CustomButton from '../components/CustomButton';

const { height } = Dimensions.get("window");

const CategoriesScreen = () => {
    const [categoryName, setCategoryName] = useState("");
    const [categories, setCategories] = useState<{ id: number; name: string; created_at: string }[]>([]);
    const { theme } = useTheme();

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
            "Delete Category",
            "Are you sure you want to delete this category?",
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Categories
                </Text>

                <View style={[styles.inputCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <TextInput
                        label='Category Name'
                        value={categoryName}
                        onChangeText={setCategoryName}
                        mode='outlined'
                        style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.border}
                        activeOutlineColor={theme.colors.primary}
                        textColor={theme.colors.text}
                        placeholderTextColor={theme.colors.placeholder}
                    />

                    <CustomButton
                        title='Add Category'
                        onPress={handleAddCategory}
                        size="medium"
                    />
                </View>

                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, { color: theme.colors.text }]}>All Categories</Text>
                    <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>{categories.length}</Text>
                    </View>
                </View>

                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <View style={[styles.categoryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                            <View style={styles.categoryInfo}>
                                <Text style={[styles.categoryName, { color: theme.colors.text }]}>{item.name}</Text>
                                <Text style={[styles.categoryDate, { color: theme.colors.textSecondary }]}>
                                    Added on {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.deleteButton, { backgroundColor: theme.colors.error + '10' }]}
                                onPress={() => handleDeleteCategory(item.id)}
                            >
                                <Entypo name='trash' size={18} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="folder-open-outline" size={64} color={theme.colors.icon} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                No categories yet. Create one above to organize your habits.
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 24,
    },
    inputCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 32,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    textInput: {
        marginBottom: 16,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    listContainer: {
        paddingBottom: 20,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
    },
    categoryDate: {
        fontSize: 12,
        marginTop: 4,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
})

export default CategoriesScreen;
