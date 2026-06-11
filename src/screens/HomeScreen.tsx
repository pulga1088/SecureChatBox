import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Avatar from '../components/Avatar';
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

export default function HomeScreen({ navigation }: any) {
    const animateIn = useRef(new Animated.Value(0)).current;
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();

    const allChats = useMemo<ChatItem[]>(
        () => [
            { id: '1', name: 'Aarav', message: 'Did you push latest build?', time: '09:14', unread: 2, avatarColor: '#1B7C6E' },
            { id: '2', name: 'Priya', message: 'Let us meet at 7 near marina.', time: '08:58', unread: 0, avatarColor: '#E28743' },
            { id: '3', name: 'Team SecureChat', message: 'Standup moved to 10:30 AM', time: 'Yesterday', unread: 4, avatarColor: '#4F5D95' },
            { id: '4', name: 'Maya', message: 'Voice note sent', time: 'Yesterday', unread: 1, avatarColor: '#C8553D' },
            { id: '5', name: 'Rahul', message: 'Got the design specs.', time: 'Tuesday', unread: 0, avatarColor: '#607D8B' },
            { id: '6', name: 'Design Sync', message: 'Call at 4 PM?', time: 'Monday', unread: 0, avatarColor: '#8E24AA' },
        ],
        []
    );

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return allChats;
        return allChats.filter((chat) => 
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            chat.message.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allChats]);

    useEffect(() => {
        Animated.timing(animateIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [animateIn]);

    return (
        <View style={styles.root}>
            <StatusBar style="dark" />
            
            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
                ListHeaderComponent={<View style={{ height: insets.top + 115 }} />} // Dynamic spacer for glass header
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
                            <Pressable
                                style={styles.chatRow}
                                onPress={() => navigation.navigate('Chat', { name: item.name, avatarColor: item.avatarColor })}
                            >
                                <Avatar name={item.name} color={item.avatarColor} />
                                <View style={styles.chatBody}>
                                    <View style={styles.chatLine}>
                                        <Text style={styles.chatName}>{item.name}</Text>
                                        <Text style={styles.chatTime}>{item.time}</Text>
                                    </View>
                                    <View style={styles.chatLine}>
                                        <Text style={styles.chatMessage} numberOfLines={1}>{item.message}</Text>
                                        {item.unread > 0 ? <Text style={styles.unread}>{item.unread}</Text> : null}
                                    </View>
                                </View>
                            </Pressable>
                        </Animated.View>
                    );
                }}
            />

            {/* iOS Glass Header Overlay */}
            <BlurView tint="light" intensity={90} style={[styles.glassHeader, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerTitle}>Chats</Text>
                        <View style={styles.headerIcons}>
                            <Ionicons name="camera-outline" size={24} color="#0B8A6D" style={{ marginRight: 16 }} />
                            <Ionicons name="add-circle" size={28} color="#0B8A6D" />
                        </View>
                    </View>
                    <View style={styles.searchWrap}>
                        <Ionicons name="search" size={18} color="#5B6770" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search messages or contacts"
                            placeholderTextColor="#8A97A1"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    glassHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerContent: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
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
        paddingHorizontal: 16,
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
});
