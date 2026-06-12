import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
        <Pressable 
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressedContainer
            ]} 
            onPress={onPress}
        >
            <Avatar name={name} size={54} />
            
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={[styles.timeText, unreadCount > 0 && styles.timeTextUnread]}>{timestamp}</Text>
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
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    pressedContainer: {
        backgroundColor: '#F4F7F9', // glossy tap effect
    },
    contentContainer: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    nameText: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.ink,
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: colors.muted,
        fontWeight: '500',
        marginLeft: 8,
    },
    timeTextUnread: {
        color: '#10A381',
        fontWeight: '700',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 15,
        color: colors.muted,
        flex: 1,
        marginRight: 8,
    },
    messageTextUnread: {
        color: colors.ink,
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#10A381',
        borderRadius: radius.pill,
        minWidth: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 7,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default ChatListItem;
