import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "../context/ThemeContext";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence, 
  withTiming 
} from "react-native-reanimated";
import { hapticFeedback } from "../lib/haptics";

const { width } = Dimensions.get("window");

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { theme } = useTheme();
    const fabScale = useSharedValue(1);

    const animatedFabStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fabScale.value }],
    }));

    const onFabPressIn = () => {
        fabScale.value = withTiming(0.9, { duration: 100 });
    };

    const onFabPressOut = () => {
        fabScale.value = withSpring(1, { damping: 12 });
        hapticFeedback.success();
        navigation.navigate("AddHabit" as any);
    };

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

                const iconName = getIconName(route.name, isFocused);
                const label = getLabel(route.name);

                // Insert FAB at index 1 (between Dashboard and Insights)
                const renderTab = (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={styles.tabButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={iconName}
                            size={24}
                            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        <Text style={[
                            styles.tabLabel,
                            {
                                color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                                fontWeight: isFocused ? '700' : '500'
                            }
                        ]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );

                if (index === 1) {
                    return (
                        <React.Fragment key="fab-group">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPressIn={onFabPressIn}
                                onPressOut={onFabPressOut}
                            >
                                <Animated.View style={[
                                    styles.fab,
                                    { backgroundColor: theme.colors.primary },
                                    animatedFabStyle
                                ]}>
                                    <Ionicons name="add" size={32} color="#fff" />
                                </Animated.View>
                            </TouchableOpacity>
                            {renderTab}
                        </React.Fragment>
                    );
                }

                return renderTab;
            })}
        </View>
    );
};

const getIconName = (routeName: string, isFocused: boolean) => {
    switch (routeName) {
        case 'DashboardTab':
            return isFocused ? 'home' : 'home-outline';
        case 'Insights':
            return isFocused ? 'analytics' : 'analytics-outline';
        case 'Settings':
            return isFocused ? 'settings' : 'settings-outline';
        default:
            return 'home';
    }
};

const getLabel = (routeName: string) => {
    switch (routeName) {
        case 'DashboardTab': return 'Home';
        case 'Insights': return 'Stats';
        case 'Settings': return 'Settings';
        default: return routeName;
    }
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 90 : 75,
        borderTopWidth: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 12,
    },
    tabLabel: {
        fontSize: 11,
        marginTop: 4,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -30,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    }
});

export default CustomTabBar;
