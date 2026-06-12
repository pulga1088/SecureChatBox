import React from 'react';
import { StyleSheet, Text, ActivityIndicator, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../constants/theme';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: object;
}

export default function PrimaryButton({ title, onPress, loading, disabled, style }: PrimaryButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.wrapper, style, animatedStyle, disabled && styles.disabled]}>
            <Pressable
                onPress={loading || disabled ? undefined : onPress}
                onPressIn={() => {
                    scale.value = withSpring(0.96);
                }}
                onPressOut={() => {
                    scale.value = withSpring(1);
                }}
            >
                <LinearGradient
                    colors={['#10A381', '#0B8A6D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.text}>{title}</Text>
                    )}
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        marginTop: 18,
        borderRadius: radius.md,
        shadowColor: '#10A381',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    gradient: {
        paddingVertical: 16,
        borderRadius: radius.md,
        alignItems: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    disabled: {
        opacity: 0.5,
        shadowOpacity: 0,
    },
});
