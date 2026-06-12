import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import { colors, radius } from '../constants/theme';

type Props = {
    title: string;
    disabled?: boolean;
    loading?: boolean;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ title, disabled = false, loading = false, onPress, style }: Props) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={[styles.button, isDisabled && styles.disabled, style]}
            disabled={isDisabled}
            onPress={onPress}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 16,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        alignItems: 'center',
        paddingVertical: 14,
    },
    disabled: {
        backgroundColor: colors.primarySoft,
    },
    text: {
        color: '#fff',
        fontWeight: '700',
    },
});
