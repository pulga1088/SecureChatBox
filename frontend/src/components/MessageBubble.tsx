import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface MessageBubbleProps {
    message: string;
    isOwnMessage: boolean;
    timestamp: string;
    status?: 'sent' | 'delivered' | 'read';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, timestamp, status = 'sent' }) => {
    const bubbleContent = (
        <View style={styles.content}>
            <Text
                style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                ]}
            >
                {message}
            </Text>
            <View style={styles.footer}>
                <Text
                    style={[
                        styles.timeText,
                        isOwnMessage ? styles.ownTimeText : styles.otherTimeText,
                    ]}
                >
                    {timestamp}
                </Text>
                {isOwnMessage && (
                    <Ionicons 
                        name={status === 'sent' ? 'checkmark' : 'checkmark-done'} 
                        size={15} 
                        color={status === 'read' ? '#4DB8FF' : 'rgba(255,255,255,0.8)'} 
                        style={{ marginLeft: 4, marginTop: 1 }}
                    />
                )}
            </View>
        </View>
    );

    return (
        <Animated.View
            entering={FadeInUp.duration(400).springify().damping(16)}
            layout={Layout.springify().damping(16)}
            style={[
                styles.container,
                isOwnMessage ? styles.ownContainer : styles.otherContainer,
            ]}
        >
            {isOwnMessage ? (
                <LinearGradient
                    colors={['#10A381', '#0B8A6D']}
                    style={[styles.bubble, styles.ownBubble]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {bubbleContent}
                </LinearGradient>
            ) : (
                <View style={[styles.bubble, styles.otherBubble]}>
                    {bubbleContent}
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        marginHorizontal: 16,
        flexDirection: 'row',
    },
    ownContainer: {
        justifyContent: 'flex-end',
    },
    otherContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '82%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    content: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    ownBubble: {
        borderTopLeftRadius: radius.lg,
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.sm,
        borderTopRightRadius: radius.lg,
    },
    otherBubble: {
        backgroundColor: '#FFFFFF',
        borderTopRightRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
        borderBottomLeftRadius: radius.sm,
        borderTopLeftRadius: radius.lg,
        borderWidth: 1,
        borderColor: '#F0F4F7',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    ownMessageText: {
        color: '#FFFFFF',
    },
    otherMessageText: {
        color: colors.ink,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 6,
    },
    timeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    ownTimeText: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    otherTimeText: {
        color: colors.muted,
    },
});

export default MessageBubble;
