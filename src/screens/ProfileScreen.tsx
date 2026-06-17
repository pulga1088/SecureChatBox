import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import { useResponsiveMetrics } from '../utils/responsive';

const settings = [
    { id: '1', title: 'Privacy', subtitle: 'Last seen, profile photo, about', icon: 'shield-checkmark' as const },
    { id: '2', title: 'Security', subtitle: 'Encryption key verified', icon: 'lock-closed' as const },
    { id: '3', title: 'Storage', subtitle: '1.2 GB used', icon: 'archive' as const },
    { id: '4', title: 'Notifications', subtitle: 'Message tone and vibration', icon: 'notifications' as const },
];

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const ui = useResponsiveMetrics();
    const { user, logout } = useAuth();
    
    return (
        <SafeAreaView style={[styles.root, { paddingTop: Math.max(insets.top, ui.spacing(10)), paddingHorizontal: ui.spacing(16) }]}>
            <StatusBar style="dark" />
            <View style={[styles.topSection, { marginTop: ui.spacing(12), marginBottom: ui.spacing(8) }]}>
                <Avatar name="Aditya" color={colors.primary} size={ui.isCompact ? 72 : 82} />
                <Text style={[styles.name, { fontSize: ui.font(22), marginTop: ui.spacing(8) }]}>Aditya</Text>
                <Text style={[styles.number, { fontSize: ui.font(14) }]}>+91 {user?.phone || '98765 43210'}</Text>
            </View>

            {settings.map((item) => (
                <Pressable key={item.id} style={[styles.card, { marginTop: ui.spacing(12), padding: ui.spacing(14), borderRadius: ui.moderate(14) }]}>
                    <View style={[styles.cardIconWrap, { width: ui.spacing(36), height: ui.spacing(36), borderRadius: ui.spacing(18), marginRight: ui.spacing(10) }]}>
                        <Ionicons name={item.icon} size={ui.font(18)} color={colors.primary} />
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={[styles.cardTitle, { fontSize: ui.font(15) }]}>{item.title}</Text>
                        <Text style={[styles.cardValue, { marginTop: ui.spacing(4), fontSize: ui.font(13) }]}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={ui.font(16)} color={colors.muted} />
                </Pressable>
            ))}

            <View style={{ marginTop: ui.spacing(20), paddingBottom: insets.bottom + ui.spacing(12) }}>
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
    },
    topSection: {
        alignItems: 'center',
    },
    name: {
        color: colors.ink,
        fontWeight: '700',
    },
    number: {
        color: colors.muted,
    },
    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.stroke,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconWrap: {
        backgroundColor: '#E9F5F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        color: colors.ink,
        fontWeight: '600',
    },
    cardValue: {
        color: colors.muted,
    },
});
