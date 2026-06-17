import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { colors, radius } from '../constants/theme';
import { useResponsiveMetrics } from '../utils/responsive';
// Typically you'd use an icon library like react-native-vector-icons or expo-vector-icons
// We'll use simple text for now, but you can swap these with real icons later.

interface ChatInputBarProps {
    onSend: (message: string) => void;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSend }) => {
    const [text, setText] = useState('');
    const ui = useResponsiveMetrics();

    const handleSend = () => {
        if (text.trim().length > 0) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <View style={[styles.container, { paddingHorizontal: ui.spacing(12), paddingVertical: ui.spacing(8), paddingBottom: Platform.OS === 'ios' ? ui.spacing(24) : ui.spacing(8) }]}>
            <TouchableOpacity style={[styles.attachButton, { width: ui.spacing(40), height: ui.spacing(40) }]}>
                <Text style={[styles.iconText, { fontSize: ui.font(20) }]}>📎</Text>
            </TouchableOpacity>
            
            <View style={[styles.inputContainer, { borderRadius: ui.moderate(20), paddingHorizontal: ui.spacing(16), paddingVertical: Platform.OS === 'ios' ? ui.spacing(10) : ui.spacing(8), marginHorizontal: ui.spacing(8), minHeight: ui.spacing(40), maxHeight: ui.spacing(120) }]}>
                <TextInput
                    style={[styles.input, { fontSize: ui.font(15), lineHeight: ui.spacing(20) }]}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.muted}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={1000}
                />
            </View>
            
            <TouchableOpacity 
                style={[
                    styles.sendButton, 
                    { width: ui.spacing(40), height: ui.spacing(40), borderRadius: ui.round(20) },
                    text.trim().length === 0 && styles.sendButtonDisabled
                ]} 
                onPress={handleSend}
                disabled={text.trim().length === 0}
            >
                <Text style={[styles.sendIcon, { fontSize: ui.font(20) }]}>↑</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.stroke,
    },
    attachButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    iconText: {
    },
    inputContainer: {
        flex: 1,
        backgroundColor: colors.bg,
        justifyContent: 'center',
    },
    input: {
        color: colors.ink,
        paddingTop: 0,
        paddingBottom: 0,
    },
    sendButton: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: colors.primarySoft,
    },
    sendIcon: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default ChatInputBar;
