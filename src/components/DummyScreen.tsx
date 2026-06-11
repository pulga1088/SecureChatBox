import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function DummyScreen({ title }: { title: string }) {
    return (
        <View style={styles.root}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.muted,
    },
});