import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../constants/theme';

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
    return (
        <View style={styles.wrap}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View style={[styles.inputWrap, !!error && styles.inputWrapError]}>
                {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    style={styles.input}
                    placeholderTextColor="#8A97A1"
                />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        marginBottom: 10,
    },
    label: {
        color: colors.ink,
        marginBottom: 6,
        fontWeight: '600',
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.stroke,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        paddingHorizontal: 12,
    },
    inputWrapError: {
        borderColor: '#D46262',
    },
    prefix: {
        color: colors.ink,
        fontWeight: '600',
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
    },
    error: {
        marginTop: 6,
        color: '#C33C3C',
        fontSize: 12,
    },
});
