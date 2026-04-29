import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../assets/types/navigationTypes';

export default function NotificationsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.emptyState}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
                        <Ionicons name="notifications-off-outline" size={64} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All quiet here</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                        You don't have any notifications at the moment. Check back later!
                    </Text>
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
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: -60,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        opacity: 0.7,
    }
});
