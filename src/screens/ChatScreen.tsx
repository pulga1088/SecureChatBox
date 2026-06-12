import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Avatar from '../components/Avatar';
import MessageBubble from '../components/MessageBubble';
import ChatInputBar from '../components/ChatInputBar';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type Message = {
    id: string;
    text: string;
    mine: boolean;
    time: string;
    status?: 'sent' | 'read';
};

export default function ChatScreen({ route }: Props) {
    const { name, avatarColor } = route.params;
    const [messages, setMessages] = useState<Message[]>([
        { id: 'm1', text: 'Hey, is encryption enabled?', mine: false, time: '09:10' },
        { id: 'm2', text: 'Yes, frontend demo is ready.', mine: true, time: '09:11', status: 'read' },
        { id: 'm3', text: 'Great. Sending release checklist.', mine: false, time: '09:12' },
    ]);

    const handleSendMessage = (text: string) => {
        setMessages((prev) => [
            ...prev,
            {
                id: String(prev.length + 1),
                text: text,
                mine: true,
                time: 'Now',
                status: 'sent',
            },
        ]);
    };

    const header = useMemo(
        () => (
            <View style={styles.header}>
                <Avatar name={name} color={avatarColor} />
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.status}>end-to-end encrypted</Text>
                </View>
            </View>
        ),
        [avatarColor, name]
    );

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            {header}

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <MessageBubble 
                            message={item.text} 
                            isOwnMessage={item.mine} 
                            timestamp={item.time} 
                        />
                    )}
                />

                <ChatInputBar onSend={handleSendMessage} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: 10,
    },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    name: {
        color: colors.ink,
        fontSize: 17,
        fontWeight: '700',
    },
    status: {
        color: colors.muted,
        fontSize: 12,
    },
    listContent: {
        paddingVertical: 8,
    },
});
