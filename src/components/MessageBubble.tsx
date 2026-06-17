import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../constants/theme';
import { useResponsiveMetrics } from '../utils/responsive';

interface MessageBubbleProps {
    message: string;
    isOwnMessage: boolean;
    timestamp: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, timestamp }) => {
    const ui = useResponsiveMetrics();

    return (
        <View
            style={[
                styles.container,
                isOwnMessage ? styles.ownContainer : styles.otherContainer,
                { marginHorizontal: ui.spacing(14), marginVertical: ui.spacing(4) },
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                    { maxWidth: ui.isCompact ? '84%' : '80%', paddingHorizontal: ui.spacing(12), paddingVertical: ui.spacing(8) },
                ]}
            >
                <Text
                    style={[
                        styles.messageText,
                        { fontSize: ui.font(15), lineHeight: ui.spacing(20) },
                        isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                    ]}
                >
                    {message}
                </Text>
                <View style={styles.footer}>
                    <Text
                        style={[
                            styles.timeText,
                            { fontSize: ui.font(11) },
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
        flexDirection: 'row',
    },
    ownContainer: {
        justifyContent: 'flex-end',
    },
    otherContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
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
    },
    timeText: {
    },
    ownTimeText: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    otherTimeText: {
        color: colors.muted,
    },
});

export default MessageBubble;
