import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OtpScreen from '../screens/OtpScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    Otp: { phone: string; mode: 'login' | 'register' };
    Home: undefined; // Maps to MainTabs
    Chat: { name: string; avatarColor: string };
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import MainTabs from './MainTabs';

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    animation: 'slide_from_right',
                    animationDuration: 260,
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Otp" component={OtpScreen} />
                <Stack.Screen name="Home" component={MainTabs} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
