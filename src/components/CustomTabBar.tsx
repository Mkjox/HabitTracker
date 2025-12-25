import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "../context/ThemeContext";

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { theme } = useTheme();

    return (
        <View style={[
            styles.tabContainer,
            {
                backgroundColor: theme.colors.tabBar,
                borderTopColor: theme.colors.border,
                paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            }
        ]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];

                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const iconName = getIconName(route.name);

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        onPress={onPress}
                        style={styles.tabButton}
                    >
                        <Ionicons
                            name={iconName}
                            size={24}
                            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        {typeof label === "string" && (
                            <Text style={[
                                styles.tabLabel,
                                {
                                    color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                                    fontWeight: isFocused ? '600' : '400'
                                }
                            ]}>
                                {label}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const getIconName = (routeName: string) => {
    switch (routeName) {
        case 'Add Habit':
            return 'add-circle-outline';
        case 'Dashboard':
            return 'home-outline';
        case 'Progress':
            return 'bar-chart-outline';
        case 'Categories':
            return 'grid-outline';
        case 'Settings':
            return 'settings-outline';
        case 'Recycle Bin':
            return 'trash-outline';
        default:
            return 'home';
    }
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 85 : 70,
        borderTopWidth: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
    }
});

export default CustomTabBar;
