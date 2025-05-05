import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import AddHabitScreen from "../pages/AddHabitScreen";
import ProgressScreen from "../pages/ProgressScreen";
import CategoriesScreen from "../pages/CategoriesScreen";
import HabitDetailsScreen from "../pages/HabitDetailsScreen";
import RecycleBinScreen from "../pages/RecycleBinScreen";
import ProgressChartScreen from "../pages/ProgressChartScreen";

import CustomTabBar from "../components/CustomTabBar";
import { RootStackParamList } from "../assets/types/navigationTypes";
import DashboardScreen from "../pages/DashboardScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Add Habit" component={AddHabitScreen} />
            <Tab.Screen name="Progress" component={ProgressScreen} />
            <Tab.Screen name="Categories" component={CategoriesScreen} />
            {/* <Tab.Screen name="ProgressChart" component={ProgressChartScreen} /> */}
            <Tab.Screen name="Recycle Bin" component={RecycleBinScreen} />
        </Tab.Navigator>
    );
}

function StackNavigator() {
    return (
        <Stack.Navigator initialRouteName="TabNavigator">
            <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />

            <Stack.Screen
                name="HabitDetails"
                component={HabitDetailsScreen}
                options={{ headerShown: false }}
            />
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
