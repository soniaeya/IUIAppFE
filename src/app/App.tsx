import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../features/preferences/screens/HomeScreen';
import PreferencesScreen from '../features/preferences/screens/PreferencesScreen';
import DestinationsScreen from '../features/preferences/screens/DestinationsScreen';
import MapScreen from '../features/preferences/screens/MapScreen';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <PaperProvider  settings={{
            icon: props => <MaterialCommunityIcons {...props} />,
        }}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="PreferencesScreen" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="HomeScreen" component={HomeScreen} />
                    <Stack.Screen name="PreferencesScreen" component={PreferencesScreen} />
                    <Stack.Screen name="DestinationsScreen" component={DestinationsScreen} />
                    <Stack.Screen name="MapScreen" component={MapScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
