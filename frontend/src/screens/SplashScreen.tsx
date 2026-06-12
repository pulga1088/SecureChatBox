import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
    const fade = useRef(new Animated.Value(0)).current;
    const moveY = useRef(new Animated.Value(30)).current; // Start slightly lower for better slide-up
    const pulse = useRef(new Animated.Value(0.96)).current;

    useEffect(() => {
        // High-quality staggered spring & timing animations
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.spring(moveY, { 
                toValue: 0, 
                friction: 6,
                tension: 40,
                useNativeDriver: true 
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.96, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, [fade, moveY, pulse]);

    return (
        <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.root}>
            <StatusBar style="light" />
            <Animated.View style={[styles.lockWrap, { opacity: fade, transform: [{ translateY: moveY }, { scale: pulse }] }]}>
                <Ionicons name="chatbubbles" size={48} color="#fff" />
            </Animated.View>
            <Animated.Text style={[styles.title, { opacity: fade, transform: [{ translateY: moveY }] }]}>SecureChat</Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: fade, transform: [{ translateY: moveY }] }]}>End-to-End Encrypted Messenger</Animated.Text>

            <Animated.View style={{ opacity: fade, width: '100%', alignItems: 'center', marginTop: 40 }}>
                <Pressable 
                    style={({ pressed }) => [
                        styles.button,
                        { transform: [{ scale: pressed ? 0.95 : 1 }] }
                    ]} 
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonText}>Start Messaging</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.primary} style={{ marginLeft: 8 }} />
                </Pressable>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    lockWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0B2B8',
        fontWeight: '500',
        textAlign: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonText: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '700',
    },
});
