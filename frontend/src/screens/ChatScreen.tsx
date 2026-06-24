import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { getMessages } from '../services/apiService';
import { getSocket } from '../services/socketService';
import { getSession } from '../services/firebaseAuth';
import { ActivityIndicator, Alert } from 'react-native';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const formatMsgTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return '';
  }
};

export const ChatScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation();
  const { chatId, name, recipientId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPeerOnline, setIsPeerOnline] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const typingTimeoutRef = useRef<any>(null);
  const isTypingRef = useRef(false);

  const fetchHistory = async () => {
    try {
      const session = await getSession();
      if (session) {
        setCurrentUserId(session.user?.id || '');
      }

      const response = await getMessages(chatId);
      if (response.status === 'success' && response.messages) {
        const mappedMessages = response.messages.map((m: any) => ({
          id: m._id,
          sender: m.sender === session?.user?.id ? 'me' : 'other',
          text: m.text,
          timestamp: m.timestamp,
          status: m.read ? 'read' : m.delivered ? 'delivered' : 'sent',
        })).reverse(); // FlatList is inverted, so newest first
        setMessages(mappedMessages);
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const socket = getSocket();
    if (socket) {
      // Send initial read receipt
      socket.emit('read_receipt', { chatId, senderId: recipientId });

      // Listen to presence updates to check if recipient is online
      socket.on('online_users_list', (usersList: string[]) => {
        setIsPeerOnline(usersList.includes(recipientId));
      });

      socket.on('presence_status', ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
        if (userId === recipientId) {
          setIsPeerOnline(status === 'online');
        }
      });
    }
  }, [chatId, recipientId]);

  // Setup Socket Listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceiveMessage = (data: { chatId: string; message: any }) => {
      if (data.chatId === chatId) {
        setMessages((prev) => {
          // Prevent duplicate message keys in real-time
          if (prev.some((m) => m.id === data.message.id)) {
            return prev;
          }
          return [data.message, ...prev];
        });
        // Send read receipt if we are currently looking at this chat
        socket.emit('read_receipt', { chatId, senderId: recipientId });
      }
    };

    const handleTypingStatus = (data: { chatId: string; senderId: string; isTyping: boolean }) => {
      if (data.chatId === chatId && data.senderId === recipientId) {
        setIsPeerTyping(data.isTyping);
      }
    };

    const handleReadSync = (data: { chatId: string; readerId: string }) => {
      if (data.chatId === chatId && data.readerId === recipientId) {
        setMessages((prev) =>
          prev.map((m) => (m.sender === 'me' ? { ...m, status: 'read' } : m))
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing_status', handleTypingStatus);
    socket.on('messages_read_sync', handleReadSync);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing_status', handleTypingStatus);
      socket.off('messages_read_sync', handleReadSync);
    };
  }, [chatId, recipientId]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const socket = getSocket();
    if (!socket) {
      Alert.alert('Error', 'Connection offline. Try again later.');
      return;
    }

    // Stop typing indicator
    if (isTypingRef.current) {
      socket.emit('typing', { chatId, recipientId, isTyping: false });
      isTypingRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    socket.emit(
      'send_message',
      {
        chatId,
        recipientId,
        text: inputText.trim(),
      },
      (res: any) => {
        if (res && res.status === 'error') {
          Alert.alert('Error', 'Failed to send message.');
        }
      }
    );

    setInputText('');
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current && text.trim() !== '') {
      isTypingRef.current = true;
      socket.emit('typing', { chatId, recipientId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        socket.emit('typing', { chatId, recipientId, isTyping: false });
        isTypingRef.current = false;
      }
    }, 1500);
  };

  const renderStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Ionicons name="checkmark" size={14} color="rgba(0, 0, 0, 0.45)" />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={14} color="rgba(0, 0, 0, 0.45)" />;
      case 'read':
        return <Ionicons name="checkmark-done" size={14} color="#C5A880" />; // Bronze receipt
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.messageRow, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isMe ? '#FFFFFF' : '#16161C',
              borderColor: isMe ? 'transparent' : 'rgba(255, 255, 255, 0.06)',
              borderWidth: 1,
              borderTopRightRadius: isMe ? 4 : 18,
              borderTopLeftRadius: isMe ? 18 : 4,
              borderRadius: 18,
            },
          ]}
        >
          <Text style={[styles.messageText, { color: isMe ? '#000000' : '#FFFFFF' }]}>
            {item.text}
          </Text>
          <View style={styles.bubbleMeta}>
            <Text style={[styles.timestamp, { color: isMe ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)' }]}>
              {formatMsgTime(item.timestamp)}
            </Text>
            {isMe && <View style={styles.statusWrapper}>{renderStatusIcon(item.status)}</View>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030303', '#0A0A0C', '#121215']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top', 'bottom']}>
        {/* Custom Header */}
        <View style={[
          styles.header,
          {
            backgroundColor: 'rgba(18, 18, 20, 0.65)',
            borderBottomColor: 'rgba(255, 255, 255, 0.06)',
          }
        ]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={[styles.avatarHeader, { backgroundColor: '#222226', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
              <Text style={styles.avatarHeaderText}>{name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerName, { color: '#FFFFFF' }]} numberOfLines={1}>
                {name}
              </Text>
              <Text style={[styles.headerStatus, { color: isPeerTyping ? '#C5A880' : colors.textSecondary }]}>
                {isPeerTyping ? 'typing...' : isPeerOnline ? 'online' : 'offline'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerActionIcon}>
              <Ionicons name="videocam-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionIcon}>
              <Ionicons name="call-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Message List */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.keyboardView}
        >
          {isLoading ? (
            <View style={styles.keyboardView}>
              <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />
            </View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              inverted
              contentContainerStyle={styles.listContent}
            />
          )}

          {/* Input Bar */}
          <View style={[
            styles.inputBar,
            {
              backgroundColor: 'rgba(18, 18, 22, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }
          ]}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.04)',
                }
              ]}
              placeholder="Secure message..."
              placeholderTextColor={colors.placeholder}
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() !== '' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                },
              ]}
              onPress={handleSend}
              disabled={inputText.trim() === ''}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={16}
                color={inputText.trim() !== '' ? '#000000' : 'rgba(255, 255, 255, 0.3)'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    paddingRight: 8,
  },
  avatarHeader: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarHeaderText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionIcon: {
    paddingHorizontal: 10,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    width: '100%',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusWrapper: {
    marginLeft: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 28,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 8 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
});
