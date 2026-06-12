import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../constants/theme';

interface MessageBubbleProps {
    message: string;
    isOwnMessage: boolean;
    timestamp: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, timestamp }) => {
    return (
        <View
            style={[
                styles.container,
                isOwnMessage ? styles.ownContainer : styles.otherContainer,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                ]}
            >
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
                </View>
            </View>
        </View>
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
        maxWidth: '80%',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    ownBubble: {
        backgroundColor: colors.primary,
        borderTopLeftRadius: radius.lg,
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.sm,
        borderTopRightRadius: radius.lg,
    },
    otherBubble: {
        backgroundColor: colors.card,
        borderTopRightRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
        borderBottomLeftRadius: radius.sm,
        borderTopLeftRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.stroke,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
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
        marginTop: 4,
    },
    timeText: {
        fontSize: 11,
    },
    ownTimeText: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    otherTimeText: {
        color: colors.muted,
    },
});

export default MessageBubble;
