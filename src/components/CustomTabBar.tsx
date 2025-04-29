import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../assets/colors/colors";

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { isDark } = useTheme();

    const themeStyles = isDark ? darkTheme : lightTheme;

    return (
        <View style={[styles.tabContainer, themeStyles.container]}>
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
                            color={isFocused ? '#6E7FEC' : '#a0a0a0'}
                        />
                        {typeof label === "string" ? (
                            <Text style={[styles.tabLabel, isFocused && styles.focusedLabel]}>
                                {label}
                            </Text>
                        ) : (
                            label({
                                focused: isFocused, color: isFocused ? '#6E7FEC' : '#a0a0a0', position: 'below-icon',
                                children: ""
                            })
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const getIconName = (routeName: string) => {
    switch (routeName) {
        case 'Home':
            return 'home-sharp';
        case 'Progress':
            return 'bar-chart-sharp';
        case 'Categories':
            return 'grid-sharp';
        case 'Recycle Bin':
            return 'trash-outline';
        case 'ProgressChart':
            return 'bar-chart-outline'
        default:
            return 'home';
    }
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6E7FEC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 5
    },
    tabLabel: {
        fontSize: 12,
        color: '#a0a0a0',
        fontFamily: 'Poppins_400Regular'
    },
    focusedLabel: {
        color: '#6E7FEC',
        fontFamily: 'Poppins_600SemiBold'
    }
});

export default CustomTabBar;