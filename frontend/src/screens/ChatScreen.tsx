import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
    Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Avatar from '../components/Avatar';
import MessageBubble from '../components/MessageBubble';
import ChatInputBar from '../components/ChatInputBar';
import { colors } from '../constants/theme';
import { useChat } from '../context/ChatContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route, navigation }: Props) {
    const { name, avatarColor, receiverId = 'dummy-id-123' } = route.params as any;
    const { messages, typingUsers, sendMessage, sendTyping, markAsRead, connected } = useChat();

    const currentMessages = messages.filter(m => m.recipientId === receiverId).length > 0
        ? messages.filter(m => m.recipientId === receiverId)
        : messages;

    const isInterlocutorTyping = typingUsers.includes(receiverId);

    React.useEffect(() => {
        markAsRead(receiverId);
    }, [messages.length]);

    const handleSendMessage = (text: string) => {
        sendMessage(receiverId, text);
    };

    const handleTyping = (isTyping: boolean) => {
        sendTyping(receiverId, isTyping);
    };

    const header = useMemo(
        () => (
            <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : 30 }]}>
                    <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 4 }}>
                        <Ionicons name="chevron-back" size={32} color={colors.ink} />
                    </Pressable>
                    <Avatar name={name} color={avatarColor} size={42} />
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.status}>
                            {connected ? 'End-to-end encrypted • Online' : 'Connecting...'}
                        </Text>
                    </View>
                </View>
            </BlurView>
        ),
        [avatarColor, name, connected, navigation]
    );

    return (
        <View style={styles.root}>
            <StatusBar style="dark" />
            
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    data={currentMessages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <MessageBubble 
                            message={item.text} 
                            isOwnMessage={item.mine} 
                            timestamp={item.time} 
                            status={item.status}
                        />
                    )}
                />

                {isInterlocutorTyping && (
                    <Animated.View entering={FadeInDown} style={{ paddingHorizontal: 24, paddingVertical: 4 }}>
                        <Text style={{ color: '#10A381', fontSize: 13, fontWeight: '600' }}>typing...</Text>
                    </Animated.View>
                )}

                <ChatInputBar onSend={handleSendMessage} onTyping={handleTyping} />
            </KeyboardAvoidingView>

            {/* Render header over the list for the glass blur effect */}
            {header}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F7F9FA',
    },
    flex: { flex: 1 },
    headerBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.3)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 14,
    },
    headerTextWrap: {
        justifyContent: 'center',
    },
    name: {
        color: colors.ink,
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    status: {
        color: colors.muted,
        fontSize: 12,
        fontWeight: '500',
    },
    listContent: {
        paddingTop: Platform.OS === 'ios' ? 120 : 100, // Make room under the absolute blur header
        paddingBottom: 20,
    },
});
