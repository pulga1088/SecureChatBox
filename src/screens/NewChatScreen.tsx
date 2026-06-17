import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Avatar from '../components/Avatar';
import { colors } from '../constants/theme';
import { useResponsiveMetrics } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'NewChat'>;

export default function NewChatScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const ui = useResponsiveMetrics();
    const [search, setSearch] = useState('');
    
    // Mock contacts
    const contacts = [
        { id: '1', name: 'Aarav', phone: '+91 98765 43211', avatarColor: '#1B7C6E' },
        { id: '2', name: 'Priya', phone: '+91 98765 43212', avatarColor: '#E28743' },
        { id: '3', name: 'Maya', phone: '+91 98765 43213', avatarColor: '#C8553D' },
        { id: '4', name: 'Rohan', phone: '+91 98765 43214', avatarColor: '#4F5D95' },
    ];

    const filteredContacts = contacts.filter(
        c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    );

    return (
        <SafeAreaView style={[styles.root, { paddingTop: Math.max(insets.top, ui.spacing(10)), paddingHorizontal: ui.spacing(16) }]}>
            <StatusBar style="dark" />
            
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={12}>
                    <Ionicons name="arrow-back" size={ui.font(22)} color={colors.ink} />
                </Pressable>
                <Text style={[styles.headerTitle, { fontSize: ui.font(20) }]}>New Chat</Text>
            </View>

            <View style={styles.searchWrap}>
                <Ionicons name="search" size={ui.font(18)} color={colors.muted} />
                <TextInput
                    style={[styles.searchInput, { fontSize: ui.font(15) }]}
                    placeholder="Search by name or phone..."
                    placeholderTextColor={colors.muted}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                />
            </View>

            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + ui.spacing(16) }]}
                renderItem={({ item }) => (
                    <Pressable
                        style={[styles.contactRow, { paddingVertical: ui.spacing(12) }]}
                        onPress={() => {
                            // Navigate to chat and replace the current screen so back button goes to home
                            navigation.replace('Chat', { name: item.name, avatarColor: item.avatarColor });
                        }}
                    >
                        <Avatar name={item.name} color={item.avatarColor} size={ui.isCompact ? 42 : 46} />
                        <View style={styles.contactInfo}>
                            <Text style={[styles.contactName, { fontSize: ui.font(15) }]}>{item.name}</Text>
                            <Text style={[styles.contactPhone, { fontSize: ui.font(13) }]}>{item.phone}</Text>
                        </View>
                    </Pressable>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontWeight: '700',
        color: colors.ink,
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.stroke,
        paddingVertical: 9,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        color: colors.ink,
    },
    listContainer: {
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.stroke,
    },
    contactInfo: {
        marginLeft: 12,
    },
    contactName: {
        fontWeight: '600',
        color: colors.ink,
    },
    contactPhone: {
        color: colors.muted,
        marginTop: 2,
    },
});
