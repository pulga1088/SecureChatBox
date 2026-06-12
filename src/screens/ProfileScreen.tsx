import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Avatar from '../components/Avatar';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';

const settings = [
    { id: '1', title: 'Privacy', subtitle: 'Last seen, profile photo, about', icon: 'shield-checkmark' as const },
    { id: '2', title: 'Security', subtitle: 'Encryption key verified', icon: 'lock-closed' as const },
    { id: '3', title: 'Storage', subtitle: '1.2 GB used', icon: 'archive' as const },
    { id: '4', title: 'Notifications', subtitle: 'Message tone and vibration', icon: 'notifications' as const },
];

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    
    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            <View style={styles.topSection}>
                <Avatar name="Aditya" color={colors.primary} size={82} />
                <Text style={styles.name}>Aditya</Text>
                <Text style={styles.number}>+91 {user?.phone || '98765 43210'}</Text>
            </View>

            {settings.map((item) => (
                <Pressable key={item.id} style={styles.card}>
                    <View style={styles.cardIconWrap}>
                        <Ionicons name={item.icon} size={18} color={colors.primary} />
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardValue}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
            ))}

            <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
                <PrimaryButton 
                    title="Logout" 
                    onPress={logout} 
                    style={{ backgroundColor: '#D9534F' }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    topSection: {
        marginTop: 18,
        alignItems: 'center',
    },
    name: {
        marginTop: 8,
        color: colors.ink,
        fontSize: 24,
        fontWeight: '700',
    },
    number: {
        marginTop: 2,
        color: colors.muted,
    },
    card: {
        marginTop: 14,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.stroke,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E9F5F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        color: colors.ink,
        fontWeight: '600',
        fontSize: 16,
    },
    cardValue: {
        marginTop: 4,
        color: colors.muted,
    },
});
