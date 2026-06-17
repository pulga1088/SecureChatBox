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
import NewChatScreen from '../screens/NewChatScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    Otp: { phone: string; mode: 'login' | 'register'; verificationId: string };
    Home: undefined;
    Chat: { name: string; avatarColor: string };
    Profile: undefined;
    NewChat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    animation: 'slide_from_right',
                    animationDuration: 260,
                }}
            >
                {user ? (
                    // Screens for logged in users
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen 
                            name="NewChat" 
                            component={NewChatScreen} 
                            options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
                        />
                    </>
                ) : (
                    // Authentication screens
                    <>
                        <Stack.Screen name="Splash" component={SplashScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="Otp" component={OtpScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
