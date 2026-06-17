import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useResponsiveMetrics } from '../utils/responsive';

type Props = {
    name: string;
    color: string;
    size?: number;
};

export default function Avatar({ name, color, size = 50 }: Props) {
    const ui = useResponsiveMetrics();
    const finalSize = ui.round(size);

    return (
        <View style={[styles.avatar, { backgroundColor: color, width: finalSize, height: finalSize, borderRadius: finalSize / 2 }]}>
            <Text style={[styles.text, { fontSize: Math.max(12, finalSize * 0.36) }]}>{name.slice(0, 1).toUpperCase()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontWeight: '700',
    },
});
