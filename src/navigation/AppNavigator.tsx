import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../pages/HomeScreen';
import ProgressScreen from '../pages/ProgressScreen';
import CategoriesScreen from '../pages/CategoriesScreen';
import HabitDetailsScreen from '../pages/HabitDetailsScreen';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import CustomTabBar from '../component/CustomTabBar';
import RecycleBinScreen from '../pages/RecycleBinScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
                name='RecycleBin'
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
            <Stack.Screen
                name='TabNavigator'
                component={TabNavigator}
                options={{
                    headerShown: false
                }}
            />

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