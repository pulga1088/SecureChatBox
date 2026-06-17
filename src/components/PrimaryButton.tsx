import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import { colors, radius } from '../constants/theme';
import { useResponsiveMetrics } from '../utils/responsive';

type Props = {
    title: string;
    disabled?: boolean;
    loading?: boolean;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ title, disabled = false, loading = false, onPress, style }: Props) {
    const isDisabled = disabled || loading;
    const ui = useResponsiveMetrics();

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={[
                styles.button,
                { paddingVertical: ui.spacing(14), borderRadius: ui.moderate(12) },
                isDisabled && styles.disabled,
                style,
            ]}
            disabled={isDisabled}
            onPress={onPress}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.text, { fontSize: ui.font(15) }]}>{title}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    disabled: {
        backgroundColor: colors.primarySoft,
    },
    text: {
        color: '#fff',
        fontWeight: '700',
    },
});
