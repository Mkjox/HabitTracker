import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity, Keyboard, Platform, ToastAndroid, Dimensions, SafeAreaView } from 'react-native';
import { fonts } from '../assets/fonts/fonts';
import { Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { Divider, TextInput } from 'react-native-paper';
import CustomButton from '../components/CustomButton';
import { useHabitStore } from '../store/useHabitStore';

const { height } = Dimensions.get("window");

const CategoriesScreen = () => {
    const [categoryName, setCategoryName] = useState("");
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null);
    const { theme } = useTheme();
    const { categories, addCategory, removeCategory } = useHabitStore();

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
        }
        catch (error) {
            Alert.alert("Error", "Category already exists or cannot be added.");
        }
    };

    const handleDeleteCategory = (id: number, name?: string) => {
        setToDelete({ id, name: name || '' });
        setDeleteModalVisible(true);
    };

    const confirmDeleteCategory = async () => {
        if (!toDelete) return;
        try {
            await removeCategory(toDelete.id);
            showToastDelete();
        } catch (error) {
            Alert.alert("Error", "Failed to delete category.");
        } finally {
            setDeleteModalVisible(false);
            setToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModalVisible(false);
        setToDelete(null);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Categories</Text>

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
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontFamily: fonts.semiBold }}>{categories.length}</Text>
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
                                onPress={() => handleDeleteCategory(item.id, item.name)}
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
                <Modal
                    visible={deleteModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={cancelDelete}
                >
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Delete Category</Text>
                            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>Are you sure you want to delete "{toDelete?.name}"? This action cannot be undone.</Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalCancel, { borderColor: theme.colors.border }]} onPress={cancelDelete}>
                                    <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.bold }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalDelete, { backgroundColor: theme.colors.error }]} onPress={confirmDeleteCategory}>
                                    <Text style={{ color: '#fff', fontFamily: fonts.bold }}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        fontFamily: fonts.bold,
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
        fontFamily: fonts.bold,
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
        fontFamily: fonts.semiBold,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 420,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: fonts.extraBold,
        marginBottom: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 18,
    },
    modalCancel: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalDelete: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default CategoriesScreen;
