import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../pages/HomeScreen';
import ProgressScreen from '../pages/ProgressScreen';
import CategoriesScreen from '../pages/CategoriesScreen';
import { NavigationContainer } from '@react-navigation/native';



const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator initialRouteName='Home'>
            <Tab.Screen
                name='Home'
                component={HomeScreen}
                options={{
                    headerShown: false
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
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <TabNavigator />
        </NavigationContainer>
    )
}