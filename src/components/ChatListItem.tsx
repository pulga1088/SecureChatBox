import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '../constants/theme';
import Avatar from './Avatar';
import { useResponsiveMetrics } from '../utils/responsive';

interface ChatListItemProps {
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    onPress: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
    name,
    lastMessage,
    timestamp,
    unreadCount = 0,
    onPress,
}) => {
    const ui = useResponsiveMetrics();

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Avatar name={name} size={ui.isCompact ? 40 : 44} />
            
            <View style={[styles.contentContainer, { marginLeft: ui.spacing(10) }]}>
                <View style={styles.headerRow}>
                    <Text style={[styles.nameText, { fontSize: ui.font(15) }]} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={[styles.timeText, { fontSize: ui.font(11) }]}>{timestamp}</Text>
                </View>
                
                <View style={styles.footerRow}>
                    <Text 
                        style={[
                            styles.messageText, 
                            { fontSize: ui.font(13) },
                            unreadCount > 0 && styles.messageTextUnread
                        ]} 
                        numberOfLines={1}
                    >
                        {lastMessage}
                    </Text>
                    
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.bg,
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontWeight: '600',
        color: colors.ink,
        flex: 1,
    },
    timeText: {
        color: colors.muted,
        marginLeft: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messageText: {
        color: colors.muted,
        flex: 1,
        marginRight: 8,
    },
    messageTextUnread: {
        color: colors.ink,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: colors.primary,
        borderRadius: radius.pill,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default ChatListItem;
