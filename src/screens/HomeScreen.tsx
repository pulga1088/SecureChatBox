import React, { useEffect, useMemo, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import ChatListItem from '../components/ChatListItem';
import { colors } from '../constants/theme';

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
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Chats</Text>
                <Pressable onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle" size={36} color="#0B8A6D" />
                </Pressable>
            </View>

            <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color="#5B6770" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search messages or contacts"
                    placeholderTextColor="#8A97A1"
                />
            </View>

            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
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
                style={styles.fab} 
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
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 32,
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
        bottom: 24,
        right: 24,
        backgroundColor: colors.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
