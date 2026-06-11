import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DummyScreen from '../components/DummyScreen';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator<any>();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any = 'chatbubbles';

                    if (route.name === 'Updates') iconName = focused ? 'aperture' : 'aperture-outline';
                    else if (route.name === 'Calls') iconName = focused ? 'call' : 'call-outline';
                    else if (route.name === 'Communities') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'Chats') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    else if (route.name === 'Settings') iconName = focused ? 'cog' : 'cog-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,
                tabBarStyle: styles.tabBar,
                tabBarBackground: () => (
                    <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
                ),
            })}
        >
            <Tab.Screen name="Updates" children={() => <DummyScreen title="Status & Updates" />} />
            <Tab.Screen name="Calls" children={() => <DummyScreen title="Call History" />} />
            <Tab.Screen name="Communities" children={() => <DummyScreen title="Communities" />} />
            <Tab.Screen name="Chats" component={HomeScreen} />
            <Tab.Screen name="Settings" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        borderTopWidth: 0,
        elevation: 0,
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
        height: 60,
        paddingBottom: 8,
    },
});
