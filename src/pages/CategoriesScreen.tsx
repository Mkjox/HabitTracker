import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity, Keyboard, Platform, ToastAndroid, Dimensions, SafeAreaView } from 'react-native';
import { fonts } from '../assets/fonts/fonts';
import { Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../assets/types/navigationTypes';
import { Divider, TextInput } from 'react-native-paper';
import CustomButton from '../components/CustomButton';
import { useHabitStore } from '../store/useHabitStore';

const { height } = Dimensions.get("window");

const CategoriesScreen = () => {
    const { t } = useTranslation();
    const [categoryName, setCategoryName] = useState("");
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null);
    const { theme } = useTheme();
    const { categories, addCategory, removeCategory } = useHabitStore();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const showToastAdd = () => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(t('categories.successAdd'), ToastAndroid.SHORT);
        }
    };

    const showToastDelete = () => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(t('categories.successDelete'), ToastAndroid.SHORT);
        }
    };

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert(t('common.error'), t('categories.errEmpty'));
            return;
        }
        try {
            await addCategory(categoryName);
            Keyboard.dismiss();
            showToastAdd();
            setCategoryName("");
        }
        catch (error) {
            Alert.alert(t('common.error'), t('categories.errExists'));
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
            Alert.alert(t('common.error'), t('categories.errDelete'));
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('categories.title')}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={[styles.inputCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <TextInput
                        label={t('categories.inputLabel')}
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
                        title={t('categories.addBtn')}
                        onPress={handleAddCategory}
                        size="medium"
                    />
                </View>

                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, { color: theme.colors.text }]}>{t('categories.allCategories')}</Text>
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
                                    {t('categories.addedOn', { date: new Date(item.created_at).toLocaleDateString() })}
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
                                {t('categories.emptyMsg')}
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
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('categories.deleteTitle')}</Text>
                            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                                {t('categories.deleteConfirm', { name: toDelete?.name })}
                            </Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalCancel, { borderColor: theme.colors.border }]} onPress={cancelDelete}>
                                    <Text style={{ color: theme.colors.textSecondary, fontFamily: fonts.bold }}>{t('categories.cancelBtn')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalDelete, { backgroundColor: theme.colors.error }]} onPress={confirmDeleteCategory}>
                                    <Text style={{ color: '#fff', fontFamily: fonts.bold }}>{t('categories.deleteBtn')}</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 20,
        marginTop: 32,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
    },
})

export default CategoriesScreen;
