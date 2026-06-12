import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { colors, radius } from '../constants/theme';
// Typically you'd use an icon library like react-native-vector-icons or expo-vector-icons
// We'll use simple text for now, but you can swap these with real icons later.

interface ChatInputBarProps {
    onSend: (message: string) => void;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSend }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim().length > 0) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.attachButton}>
                <Text style={styles.iconText}>📎</Text>
            </TouchableOpacity>
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
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
                    text.trim().length === 0 && styles.sendButtonDisabled
                ]} 
                onPress={handleSend}
                disabled={text.trim().length === 0}
            >
                <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.stroke,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8, // Safe area for iOS
    },
    attachButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        marginBottom: 2,
    },
    iconText: {
        fontSize: 20,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: colors.bg,
        borderRadius: radius.xl,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        marginHorizontal: 8,
        minHeight: 40,
        maxHeight: 120,
        justifyContent: 'center',
    },
    input: {
        color: colors.ink,
        fontSize: 15,
        lineHeight: 20,
        paddingTop: 0,
        paddingBottom: 0,
    },
    sendButton: {
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: colors.primarySoft,
    },
    sendIcon: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default ChatInputBar;
