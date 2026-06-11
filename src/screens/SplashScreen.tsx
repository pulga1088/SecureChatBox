import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
    const fade = useRef(new Animated.Value(0)).current;
    const moveY = useRef(new Animated.Value(18)).current;
    const pulse = useRef(new Animated.Value(0.96)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(moveY, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.96, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, [fade, moveY, pulse]);

    return (
        <LinearGradient colors={['#0E9777', '#0B6F59']} style={styles.root}>
            <StatusBar style="light" />
            <Animated.View style={[styles.lockWrap, { opacity: fade, transform: [{ translateY: moveY }, { scale: pulse }] }]}>
                <Ionicons name="lock-closed" size={40} color="#fff" />
            </Animated.View>
            <Animated.Text style={[styles.title, { opacity: fade }]}>SecureChat</Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: fade }]}>Frontend-only encrypted chat UI experience</Animated.Text>

            <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.buttonText}>Start Messaging</Text>
            </Pressable>

            <View style={styles.badge}>
                <Text style={styles.badgeText}>Metro Ready</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    lockWrap: {
        height: 86,
        width: 86,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 38,
        fontWeight: '800',
    },
    subtitle: {
        marginTop: 8,
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        marginBottom: 28,
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
    },
    buttonText: {
        color: '#0B6F59',
        fontSize: 15,
        fontWeight: '700',
    },
    badge: {
        position: 'absolute',
        bottom: 42,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
