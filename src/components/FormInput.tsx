import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../constants/theme';
import { useResponsiveMetrics } from '../utils/responsive';

type Props = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    label?: string;
    prefix?: string;
    keyboardType?: 'default' | 'number-pad';
    maxLength?: number;
    error?: string;
};

export default function FormInput({
    value,
    onChangeText,
    placeholder,
    label,
    prefix,
    keyboardType = 'default',
    maxLength,
    error,
}: Props) {
    const ui = useResponsiveMetrics();

    return (
        <View style={[styles.wrap, { marginBottom: ui.spacing(10) }]}>
            {label ? <Text style={[styles.label, { marginBottom: ui.spacing(6), fontSize: ui.font(14) }]}>{label}</Text> : null}
            <View
                style={[
                    styles.inputWrap,
                    {
                        borderRadius: ui.moderate(12),
                        paddingHorizontal: ui.spacing(12),
                        minHeight: ui.spacing(48),
                    },
                    !!error && styles.inputWrapError,
                ]}
            >
                {prefix ? <Text style={[styles.prefix, { marginRight: ui.spacing(8), fontSize: ui.font(14) }]}>{prefix}</Text> : null}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    style={[styles.input, { fontSize: ui.font(15), height: ui.spacing(48) }]}
                    placeholderTextColor="#8A97A1"
                />
            </View>
            {error ? <Text style={[styles.error, { fontSize: ui.font(12), marginTop: ui.spacing(6) }]}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        color: colors.ink,
        fontWeight: '600',
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.stroke,
        backgroundColor: colors.card,
    },
    inputWrapError: {
        borderColor: '#D46262',
    },
    prefix: {
        color: colors.ink,
        fontWeight: '600',
    },
    input: {
        flex: 1,
    },
    error: {
        color: '#C33C3C',
    },
});
