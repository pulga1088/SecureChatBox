import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChats } from '../services/apiService';
import { getSession } from '../services/firebaseAuth';
import { connectSocket, getSocket } from '../services/socketService';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const formatTime = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' });
};

const getAvatarColor = (name: string) => {
  const colorsList = ['#1A1A1E', '#2A2A2E', '#36363C', '#222226', '#2D2D32', '#1E1E22'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorsList.length;
  return colorsList[index];
};

export const HomeScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const session = await getSession();
      if (session) {
        setCurrentUserId(session.user?.id || '');
        
        // 1. Establish Socket Connection
        connectSocket(session.backendToken || '');
        
        // 2. Fetch Chat List from API
        const response = await getChats();
        if (response.status === 'success' && response.chats) {
          setChats(response.chats);
        }
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Setup Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePresence = ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    };

    const handleOnlineUsersList = (usersList: string[]) => {
      setOnlineUsers(new Set(usersList));
    };

    const handleReceiveMessage = ({ chatId, message }: { chatId: string; message: any }) => {
      setChats((prevChats) => {
        const chatIdx = prevChats.findIndex((c) => c._id === chatId);
        if (chatIdx === -1) {
          loadData();
          return prevChats;
        }

        const updatedChats = [...prevChats];
        const chat = updatedChats[chatIdx];
        const isMe = message.sender === 'me';

        updatedChats[chatIdx] = {
          ...chat,
          lastMessage: {
            text: message.text,
            sender: isMe ? currentUserId : 'other',
            timestamp: message.timestamp,
          },
          unreadCount: isMe ? 0 : (chat.unreadCount || 0) + 1,
          updatedAt: message.timestamp,
        };

        return updatedChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    socket.on('presence_status', handlePresence);
    socket.on('online_users_list', handleOnlineUsersList);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('presence_status', handlePresence);
      socket.off('online_users_list', handleOnlineUsersList);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [currentUserId]);

  const filteredChats = chats.filter((chat) => {
    const peer = chat.participants.find((p: any) => p._id !== currentUserId);
    if (!peer) return false;
    const nameMatch = peer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const lastMsgText = chat.lastMessage?.text || '';
    const messageMatch = lastMsgText.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || messageMatch;
  });

  const renderChatItem = ({ item }: { item: any }) => {
    const peer = item.participants.find((p: any) => p._id !== currentUserId);
    if (!peer) return null;

    const peerName = peer.name;
    const avatarText = peerName.split(' ').map((n: any) => n[0]).join('').slice(0, 2).toUpperCase();
    const avatarColor = getAvatarColor(peerName);
    const lastMsgText = item.lastMessage?.text || 'No messages yet';
    const timeFormatted = formatTime(item.lastMessage?.timestamp || item.updatedAt);
    const isOnline = onlineUsers.has(peer._id);
    const unreadCount = item.unreadCount || 0;

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          {
            backgroundColor: 'rgba(20, 20, 24, 0.55)',
            borderColor: 'rgba(255, 255, 255, 0.05)',
            borderBottomWidth: 1,
          }
        ]}
        onPress={() => {
          setChats((prev) => {
            const next = [...prev];
            const idx = next.findIndex((c) => c._id === item._id);
            if (idx !== -1) {
              next[idx] = { ...next[idx], unreadCount: 0 };
            }
            return next;
          });
          navigation.navigate('Chat', { chatId: item._id, name: peerName, recipientId: peer._id });
        }}
        activeOpacity={0.7}
      >
        {/* Avatar Container */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>
          {isOnline && (
            <View style={[styles.onlineIndicator, { borderColor: '#050505' }]} />
          )}
        </View>

        {/* Info Middle Column */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeaderRow}>
            <Text style={[styles.chatName, { color: '#FFFFFF' }]} numberOfLines={1}>
              {peerName}
            </Text>
            <Text style={[styles.chatTime, { color: colors.textSecondary }]}>
              {timeFormatted}
            </Text>
          </View>
          <View style={styles.chatMessageRow}>
            <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
              {lastMsgText}
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: '#C5A880' }]}>
                <Text style={[styles.unreadCountText, { color: '#000000' }]}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030303', '#0A0A0C', '#121215']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Chats</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('NewChat')} style={styles.headerIcon}>
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerIcon}>
              <Ionicons name="person-circle-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[
            styles.searchBar,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }
          ]}>
            <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: '#FFFFFF' }]}
              placeholder="Search conversations..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chat List */}
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item._id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No chats found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 52,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  chatName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  chatTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
    fontWeight: '400',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
