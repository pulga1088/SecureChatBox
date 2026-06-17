import React, { useEffect, useMemo, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import ChatListItem from '../components/ChatListItem';
import { colors } from '../constants/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveMetrics } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type ChatItem = {
    id: string;
    name: string;
    message: string;
    time: string;
    unread: number;
    avatarColor: string;
};

export default function HomeScreen({ navigation }: Props) {
    const animateIn = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const ui = useResponsiveMetrics();
    const chats = useMemo<ChatItem[]>(
        () => [
            { id: '1', name: 'Aarav', message: 'Did you push latest build?', time: '09:14', unread: 2, avatarColor: '#1B7C6E' },
            { id: '2', name: 'Priya', message: 'Let us meet at 7 near marina.', time: '08:58', unread: 0, avatarColor: '#E28743' },
            { id: '3', name: 'Team SecureChat', message: 'Standup moved to 10:30 AM', time: 'Yesterday', unread: 4, avatarColor: '#4F5D95' },
            { id: '4', name: 'Maya', message: 'Voice note sent', time: 'Yesterday', unread: 1, avatarColor: '#C8553D' },
        ],
        []
    );

    useEffect(() => {
        Animated.timing(animateIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [animateIn]);

    return (
        <SafeAreaView
            style={[
                styles.root,
                {
                    paddingTop: Math.max(insets.top, ui.spacing(8)),
                    paddingHorizontal: ui.spacing(16),
                },
            ]}
            edges={['top', 'left', 'right']}
        >
            <StatusBar style="dark" />
            <View style={[styles.headerRow, { marginBottom: ui.spacing(8) }]}>
                <Text style={[styles.headerTitle, { fontSize: ui.isCompact ? 24 : 28 }]}>Chats</Text>
                <Pressable
                    onPress={() => navigation.navigate('Profile')}
                    hitSlop={16}
                    style={styles.profileButton}
                >
                    <Ionicons name="person-circle" size={ui.isCompact ? 34 : 38} color="#0B8A6D" />
                </Pressable>
            </View>

            <View style={[styles.searchWrap, { paddingVertical: ui.spacing(9), paddingHorizontal: ui.spacing(12) }]}>
                <Ionicons name="search" size={ui.isCompact ? 17 : 18} color="#5B6770" />
                <TextInput
                    style={[styles.searchInput, { fontSize: ui.font(15) }]}
                    placeholder="Search messages or contacts"
                    placeholderTextColor="#8A97A1"
                />
            </View>

            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContainer,
                    { paddingBottom: insets.bottom + ui.spacing(96), paddingTop: ui.spacing(8) },
                ]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const start = index * 0.08;
                    const itemOpacity = animateIn.interpolate({
                        inputRange: [start, Math.min(1, start + 0.3)],
                        outputRange: [0, 1],
                        extrapolate: 'clamp',
                    });
                    const itemRise = animateIn.interpolate({
                        inputRange: [start, Math.min(1, start + 0.3)],
                        outputRange: [8, 0],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View style={{ opacity: itemOpacity, transform: [{ translateY: itemRise }] }}>
                            <ChatListItem
                                name={item.name}
                                lastMessage={item.message}
                                timestamp={item.time}
                                unreadCount={item.unread}
                                onPress={() => navigation.navigate('Chat', { name: item.name, avatarColor: item.avatarColor })}
                            />
                        </Animated.View>
                    );
                }}
            />
            
            <Pressable
                style={[styles.fab, { bottom: Math.max(insets.bottom, ui.spacing(12)) + ui.spacing(12) }]}
                onPress={() => navigation.navigate('NewChat')}
            >
                <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontWeight: '700',
        color: colors.ink,
    },
    profileButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.stroke,
    },
    searchInput: {
        flex: 1,
        color: colors.ink,
    },
    listContainer: {
        paddingTop: 8,
    },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E9EEF1',
    },
    chatBody: {
        flex: 1,
        marginLeft: 12,
    },
    chatLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatName: {
        color: colors.ink,
        fontSize: 16,
        fontWeight: '600',
    },
    chatTime: {
        color: colors.muted,
        fontSize: 12,
    },
    chatMessage: {
        color: colors.muted,
        marginTop: 2,
        width: '84%',
    },
    unread: {
        marginTop: 2,
        minWidth: 20,
        textAlign: 'center',
        color: '#fff',
        fontSize: 11,
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 3,
        overflow: 'hidden',
    },
    fab: {
        position: 'absolute',
        right: 24,
        backgroundColor: colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
