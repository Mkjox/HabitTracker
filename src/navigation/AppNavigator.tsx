import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import DashboardScreen from "../pages/DashboardScreen";
import InsightsScreen from "../pages/InsightsScreen";
import SettingsScreen from "../pages/SettingsScreen";
import AddHabitScreen from "../pages/AddHabitScreen";
import CategoriesScreen from "../pages/CategoriesScreen";
import RecycleBinScreen from "../pages/RecycleBinScreen";
import HabitDetailsScreen from "../pages/HabitDetailsScreen";
import NotificationsScreen from "../pages/NotificationsScreen";
import CustomTabBar from "../components/CustomTabBar";
import { RootStackParamList } from "../assets/types/navigationTypes";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="DashboardTab"
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="DashboardTab" component={DashboardScreen} />
            <Tab.Screen name="Insights" component={InsightsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName="Tabs">
            <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="HabitDetails" component={HabitDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddHabit" component={AddHabitScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Categories" component={CategoriesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Recycle Bin" component={RecycleBinScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <StackNavigator />
        </NavigationContainer>
    );
}
