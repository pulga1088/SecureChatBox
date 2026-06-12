import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, FadeInRight, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
    avatarColor?: string;
};

export default function HomeScreen({ navigation }: Props) {
    const chats: ChatItem[] = [
        { id: '1', name: 'Alice Adams', message: 'See you tomorrow! 👋', time: '10:42 AM', unread: 2, avatarColor: '#FF6B6B' },
        { id: '2', name: 'Design Team', message: 'Can you check the new glossy UI?', time: '09:15 AM', unread: 1, avatarColor: '#4ECDC4' },
        { id: '3', name: 'Bob Builder', message: 'I finished framing the animations.', time: 'Yesterday', unread: 0, avatarColor: '#45B7D1' },
    ];

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            <Animated.View entering={FadeInDown.duration(500).springify().damping(14)} style={styles.headerRow}>
                <Text style={styles.headerTitle}>Chats</Text>
                <Pressable onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle" size={40} color="#0B8A6D" />
                </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(500).springify().damping(14)} style={styles.searchContainer}>
                <View style={styles.searchWrap}>
                    <Ionicons name="search" size={20} color="#8A97A1" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search messages or contacts"
                        placeholderTextColor="#8A97A1"
                    />
                </View>
            </Animated.View>

            {chats.length === 0 ? (
                <Animated.View entering={FadeIn.delay(300)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="chatbox-ellipses-outline" size={60} color="#DCE3E8" />
                    <Text style={{ marginTop: 12, color: colors.muted, fontSize: 16 }}>No chats yet</Text>
                    <Text style={{ marginTop: 4, color: '#A0B2B8', fontSize: 14 }}>Tap the button below to start a new chat!</Text>
                </Animated.View>
            ) : (
                <Animated.FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    itemLayoutAnimation={Layout.springify().damping(14)}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInRight.delay(150 + index * 100).springify().damping(14)}>
                            <View style={styles.cardWrapper}>
                                <ChatListItem
                                    name={item.name}
                                    lastMessage={item.message}
                                    timestamp={item.time}
                                    unreadCount={item.unread}
                                    onPress={() => navigation.navigate('Chat', { name: item.name, avatarColor: item.avatarColor, receiverId: item.id })}
                                />
                            </View>
                        </Animated.View>
                    )}
                />
            )}
            
            <Animated.View entering={FadeIn.delay(600).springify()} style={styles.fabContainer}>
                <Pressable onPress={() => navigation.navigate('NewChat')}>
                    <LinearGradient
                        colors={['#10A381', '#0B8A6D']}
                        style={styles.fab}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="chatbubbles" size={26} color="#FFFFFF" />
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        paddingTop: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: colors.ink,
        letterSpacing: -0.5,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        color: colors.ink,
        fontSize: 16,
    },
    listContainer: {
        paddingTop: 8,
        paddingBottom: 100,
    },
    cardWrapper: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
        overflow: 'hidden',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        shadowColor: '#10A381',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
