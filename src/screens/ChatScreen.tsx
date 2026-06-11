import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Avatar from '../components/Avatar';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type Message = {
    id: string;
    text: string;
    mine: boolean;
    time: string;
    status?: 'sent' | 'read';
};

export default function ChatScreen({ route, navigation }: Props) {
    const { name, avatarColor } = route.params;
    const insets = useSafeAreaInsets();
    const [composer, setComposer] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 'm1', text: 'Hey, is encryption enabled?', mine: false, time: '09:10' },
        { id: 'm2', text: 'Yes, frontend demo is ready.', mine: true, time: '09:11', status: 'read' },
        { id: 'm3', text: 'Great. Sending release checklist.', mine: false, time: '09:12' },
    ]);

    const sendMessage = () => {
        if (!composer.trim()) return;
        setMessages((prev) => [
            ...prev,
            {
                id: String(prev.length + 1),
                text: composer.trim(),
                mine: true,
                time: 'Now',
                status: 'sent',
            },
        ]);
        setComposer('');
    };

    const header = useMemo(
        () => (
            <BlurView tint="light" intensity={85} style={[styles.glassHeader, { paddingTop: insets.top }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
                        <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    </Pressable>
                    <Avatar name={name} color={avatarColor} size={42} />
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.status}>end-to-end encrypted</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <Ionicons name="videocam-outline" size={24} color={colors.primary} />
                        <Ionicons name="call-outline" size={22} color={colors.primary} />
                    </View>
                </View>
            </BlurView>
        ),
        [avatarColor, name, insets.top, navigation]
    );

    return (
        <View style={styles.root}>
            <StatusBar style="dark" />
            {header}

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 70 }]}
                    renderItem={({ item }) => (
                        <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleOther]}>
                            <Text style={styles.bubbleText}>{item.text}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.bubbleTime}>{item.time}</Text>
                                {item.mine ? (
                                    <Ionicons
                                        name={item.status === 'read' ? 'checkmark-done' : 'checkmark'}
                                        size={13}
                                        color={item.status === 'read' ? colors.primary : colors.muted}
                                    />
                                ) : null}
                            </View>
                        </View>
                    )}
                />
                
                {composer.trim().length > 0 ? (
                    <Text style={styles.typing}>typing...</Text>
                ) : null}

                <BlurView tint="light" intensity={90} style={[styles.glassComposer, { paddingBottom: insets.bottom || 12 }]}>
                    <View style={styles.composerRow}>
                        <Pressable style={styles.actionIcon} accessibilityLabel="Attach file">
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </Pressable>
                        <TextInput
                            placeholder="Type a message"
                            style={styles.composerInput}
                            value={composer}
                            onChangeText={setComposer}
                            multiline
                        />
                        {composer.trim().length > 0 ? (
                            <Pressable style={styles.sendButton} onPress={sendMessage}>
                                <Ionicons name="send" size={16} color="#fff" />
                            </Pressable>
                        ) : (
                            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingRight: 4 }}>
                                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                                <Ionicons name="mic-outline" size={24} color={colors.primary} />
                            </View>
                        )}
                    </View>
                </BlurView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    flex: { flex: 1 },
    glassHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.stroke,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 10,
    },
    headerTextWrap: {
        flex: 1,
        marginLeft: 10,
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
    typing: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
        position: 'absolute',
        bottom: 74,
        left: 20,
        zIndex: 5,
    },
    listContent: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        gap: 8,
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.stroke,
    },
    bubbleMine: {
        alignSelf: 'flex-end',
        backgroundColor: colors.accent,
    },
    bubbleOther: {
        alignSelf: 'flex-start',
        backgroundColor: colors.card,
    },
    bubbleText: {
        color: colors.ink,
        fontSize: 15,
    },
    metaRow: {
        marginTop: 4,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 4,
    },
    bubbleTime: {
        color: colors.muted,
        fontSize: 11,
        textAlign: 'right',
    },
    glassComposer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.stroke,
    },
    composerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    actionIcon: {
        padding: 4,
        paddingBottom: 8,
    },
    composerInput: {
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.stroke,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 10,
        minHeight: 38,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
});
