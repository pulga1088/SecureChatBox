import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
    name: string;
    color: string;
    size?: number;
};

export default function Avatar({ name, color, size = 50 }: Props) {
    return (
        <View style={[styles.avatar, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.text, { fontSize: Math.max(14, size * 0.36) }]}>{name.slice(0, 1).toUpperCase()}</Text>
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
