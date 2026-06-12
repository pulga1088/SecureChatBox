import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Avatar from '../components/Avatar';
import { colors } from '../constants/theme';
import { API_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'NewChat'>;

type UserAPI = {
    _id: string;
    name: string;
    phone: string;
};

export default function NewChatScreen({ navigation }: Props) {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [contacts, setContacts] = useState<UserAPI[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real users from our backend
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users`);
                const data = await res.json();
                
                // Filter out ourselves from the contact list
                const otherUsers = data.filter((u: UserAPI) => u._id !== user?.id);
                setContacts(otherUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user?.id]);

    const filteredContacts = contacts.filter(
        c => (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)
    );

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.ink} />
                </Pressable>
                <Text style={styles.headerTitle}>New Chat</Text>
            </View>

            <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color={colors.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or phone..."
                    placeholderTextColor={colors.muted}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                />
            </View>

            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} /> 
                            : <Text style={{ textAlign: 'center', marginTop: 20, color: colors.muted }}>No other users registered yet.</Text>
                }
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.contactRow}
                        onPress={() => {
                            // Pass the actual receiverId to the Chat Screen!
                            navigation.replace('Chat', { 
                                name: item.name || item.phone, 
                                avatarColor: colors.primary,
                                receiverId: item._id
                            });
                        }}
                    >
                        <Avatar name={item.name || item.phone} color={colors.primary} size={46} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactName}>{item.name || 'Unknown'}</Text>
                            <Text style={styles.contactPhone}>{item.phone}</Text>
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
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
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
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        color: colors.ink,
        fontSize: 16,
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.stroke,
    },
    contactInfo: {
        marginLeft: 12,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.ink,
    },
    contactPhone: {
        fontSize: 14,
        color: colors.muted,
        marginTop: 2,
    },
});
