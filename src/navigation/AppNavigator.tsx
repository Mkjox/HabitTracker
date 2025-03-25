import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import HomeScreen from "../pages/HomeScreen";
import ProgressScreen from "../pages/ProgressScreen";
import CategoriesScreen from "../pages/CategoriesScreen";
import HabitDetailsScreen from "../pages/HabitDetailsScreen";
import RecycleBinScreen from "../pages/RecycleBinScreen";

import CustomTabBar from "../component/CustomTabBar";
import { RootStackParamList } from "../assets/types/navigationTypes";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Progress" component={ProgressScreen} />
            <Tab.Screen name="Categories" component={CategoriesScreen} />
            <Tab.Screen name="RecycleBin" component={RecycleBinScreen} />
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
