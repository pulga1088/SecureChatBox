import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { colors } from '../constants/theme';

const settings = [
    { id: '1', title: 'Account', subtitle: 'Security notifications, change number', icon: 'key' as const, bg: '#F48E24' },
    { id: '2', title: 'Privacy', subtitle: 'Block contacts, disappearing messages', icon: 'lock-closed' as const, bg: '#3CADEF' },
    { id: '3', title: 'Chats', subtitle: 'Theme, wallpapers, chat history', icon: 'chatbox' as const, bg: '#4CAF50' },
    { id: '4', title: 'Notifications', subtitle: 'Message, group & call tones', icon: 'notifications' as const, bg: '#F44336' },
    { id: '5', title: 'Storage and data', subtitle: 'Network usage, auto-download', icon: 'pie-chart' as const, bg: '#8BC34A' },
];

export default function ProfileScreen({ navigation }: any) {
    return (
        <View style={styles.root}>
            <StatusBar style="dark" />
            <SafeAreaView edges={['top']} style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.topSection}>
                    <Avatar name="Aditya" color={colors.primary} size={68} />
                    <View style={styles.profileText}>
                        <Text style={styles.name}>Aditya</Text>
                        <Text style={styles.status}>Frontend designer</Text>
                    </View>
                    <Ionicons name="qr-code-outline" size={24} color={colors.primary} style={styles.qr} />
                </View>

                <View style={styles.settingsGroup}>
                    {settings.map((item, index) => (
                        <Pressable key={item.id} style={[styles.card, index === settings.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={[styles.cardIconWrap, { backgroundColor: item.bg }]}>
                                <Ionicons name={item.icon} size={18} color="#fff" />
                            </View>
                            <View style={styles.cardBody}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F2F2F7', // iOS settings gray background
    },
    header: {
        backgroundColor: colors.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.stroke,
        paddingBottom: 10,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.ink,
        marginTop: 10,
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 100, // accommodate bottom tab
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: colors.stroke,
        marginBottom: 30,
    },
    profileText: {
        marginLeft: 14,
        flex: 1,
    },
    name: {
        color: colors.ink,
        fontSize: 20,
        fontWeight: '600',
    },
    status: {
        marginTop: 2,
        color: colors.muted,
        fontSize: 14,
    },
    qr: {
        padding: 8,
        backgroundColor: '#F4F6F8',
        borderRadius: 20,
        overflow: 'hidden',
    },
    settingsGroup: {
        backgroundColor: colors.card,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: colors.stroke,
        paddingLeft: 16,
    },
    card: {
        paddingVertical: 12,
        paddingRight: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.stroke,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        color: colors.ink,
        fontSize: 16,
    },
});
