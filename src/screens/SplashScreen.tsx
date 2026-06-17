import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useResponsiveMetrics } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const ui = useResponsiveMetrics();
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
        <LinearGradient colors={['#0E9777', '#0B6F59']} style={[styles.root, { paddingHorizontal: ui.spacing(24), paddingTop: insets.top + ui.spacing(24), paddingBottom: insets.bottom + ui.spacing(24) }]}>
            <StatusBar style="light" />
            <Animated.View style={[styles.lockWrap, { width: ui.spacing(86), height: ui.spacing(86), borderRadius: ui.spacing(22), opacity: fade, transform: [{ translateY: moveY }, { scale: pulse }] }]}>
                <Ionicons name="lock-closed" size={ui.font(40)} color="#fff" />
            </Animated.View>
            <Animated.Text style={[styles.title, { fontSize: ui.font(38), opacity: fade }]}>SecureChat</Animated.Text>
            <Animated.Text style={[styles.subtitle, { fontSize: ui.font(15), marginBottom: ui.spacing(28), opacity: fade }]}>Frontend-only encrypted chat UI experience</Animated.Text>

            <Pressable style={[styles.button, { paddingVertical: ui.spacing(14), paddingHorizontal: ui.spacing(24), borderRadius: ui.moderate(14) }]} onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.buttonText, { fontSize: ui.font(15) }]}>Start Messaging</Text>
            </Pressable>

            <View style={[styles.badge, { bottom: insets.bottom + ui.spacing(18), paddingHorizontal: ui.spacing(12), paddingVertical: ui.spacing(6), borderRadius: ui.moderate(16) }]}>
                <Text style={[styles.badgeText, { fontSize: ui.font(12) }]}>Metro Ready</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontWeight: '800',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
    },
    button: {
        backgroundColor: '#fff',
    },
    buttonText: {
        color: '#0B6F59',
        fontWeight: '700',
    },
    badge: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    badgeText: {
        color: '#fff',
        fontWeight: '600',
    },
});
