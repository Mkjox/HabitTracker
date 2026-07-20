import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../assets/fonts/fonts';
import { RootStackParamList } from '../assets/types/navigationTypes';
import { changeLanguage } from '../lib/i18n';

export default function LanguageScreen() {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const currentLanguage = i18n.language;

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' },
    ];

    const handleSelectLanguage = (code: string) => {
        changeLanguage(code);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('settings.language')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    {t('settings.languageDesc')}
                </Text>

                <View style={[styles.listContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    {languages.map((lang, index) => {
                        const isSelected = currentLanguage === lang.code;
                        return (
                            <React.Fragment key={lang.code}>
                                <TouchableOpacity
                                    style={styles.languageRow}
                                    onPress={() => handleSelectLanguage(lang.code)}
                                >
                                    <Text style={[
                                        styles.languageText, 
                                        { color: isSelected ? theme.colors.primary : theme.colors.text }
                                    ]}>
                                        {lang.name}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                                {index < languages.length - 1 && (
                                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        marginTop: 32
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 15,
        fontFamily: fonts.medium,
        marginBottom: 24,
        lineHeight: 22,
    },
    listContainer: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    languageText: {
        fontSize: 16,
        fontFamily: fonts.semiBold,
    },
    divider: {
        height: 1,
        marginLeft: 20,
    }
});
