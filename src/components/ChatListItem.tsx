import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '../constants/theme';
import Avatar from './Avatar';

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
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Avatar name={name} size={50} />
            
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={styles.timeText}>{timestamp}</Text>
                </View>
                
                <View style={styles.footerRow}>
                    <Text 
                        style={[
                            styles.messageText, 
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.bg,
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.ink,
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: colors.muted,
        marginLeft: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 14,
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
