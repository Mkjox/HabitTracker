import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../pages/HomeScreen';
import ProgressScreen from '../pages/ProgressScreen';
import CategoriesScreen from '../pages/CategoriesScreen';
import HabitDetailsScreen from '../pages/HabitDetailsScreen';
import CustomTabBar from '../component/CustomTabBar';
import RecycleBinScreen from '../pages/RecycleBinScreen';
// import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../assets/types/navigationTypes';

const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// export type RootStackParamList = {
//     TabNavigator: undefined;
//     HabitDetails: { habitId: number };
//   };

function TabNavigator() {
    return (
        <Tab.Navigator initialRouteName='Home' tabBar={(props) => <CustomTabBar{...props} />}>
            <Tab.Screen
                name='Home'
                component={HomeScreen}
                options={{
                    headerShown: false,

                }}
            />

            <Tab.Screen
                name='Progress'
                component={ProgressScreen}
                options={{
                    headerShown: false
                }}
            />

            <Tab.Screen
                name='Categories'
                component={CategoriesScreen}
                options={{
                    headerShown: false
                }}
            />

            <Tab.Screen
                name='Recycle Bin'
                component={RecycleBinScreen}
                options={{
                    headerShown: false
                }}
            />

        </Tab.Navigator>
    );
}

function StackNavigator() {
    return (
        <Stack.Navigator>
            {/* <Stack.Screen
                name='TabNavigator'
                component={TabNavigator}
                options={{
                    headerShown: false
                }}
            /> */}

            <Stack.Screen
                name='HabitDetails'
                component={HabitDetailsScreen}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <StackNavigator />
        </NavigationContainer>
    )
}