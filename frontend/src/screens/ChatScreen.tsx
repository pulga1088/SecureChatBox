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
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Image,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { getMessages, uploadFile } from '../services/apiService';
import { getSocket, connectSocket } from '../services/socketService';
import { getSession } from '../services/firebaseAuth';
import { ActivityIndicator, Alert } from 'react-native';
import { encryptMessage, decryptMessage } from '../services/encryptionService';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  reactions?: { userId: string; emoji: string }[];
}

const POPULAR_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
  '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
  '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '👋', '👍', '👎', '👊', '👏', '🙌', '🙏', '💪', '❤️', '💔'
];

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

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
  const [socket, setSocket] = useState<any>(getSocket());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<any>(null);
  const isTypingRef = useRef(false);
  const [isSocketConnected, setIsSocketConnected] = useState(socket?.connected || false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setIsSocketConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  const fetchHistory = async () => {
    try {
      const session = await getSession();
      if (session) {
        setCurrentUserId(session.user?.id || (session.user as any)?._id || '');
        const activeSocket = connectSocket(session.backendToken || '');
        setSocket(activeSocket);
      }

      const response = await getMessages(chatId);
      if (response.status === 'success' && response.messages) {
        const mappedMessages = response.messages.map((m: any) => ({
          id: m._id,
          sender: m.sender === session?.user?.id || m.sender === (session?.user as any)?._id ? 'me' : 'other',
          text: decryptMessage(m.text, chatId),
          timestamp: m.timestamp,
          status: m.read ? 'read' : m.delivered ? 'delivered' : 'sent',
          reactions: m.reactions || [],
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
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setShowEmojiPicker(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const toggleEmojiPicker = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
      inputRef.current?.focus();
    } else {
      Keyboard.dismiss();
      setShowEmojiPicker(true);
    }
  };
  const uploadAndSendFile = async (uri: string, type: 'image' | 'file', originalName: string, mimeType: string) => {
    setIsUploading(true);
    setShowAttachmentMenu(false);
    try {
      const uploadRes = await uploadFile(uri, mimeType, originalName);
      if (uploadRes && uploadRes.status === 'success' && uploadRes.fileUrl) {
        const fileUrl = uploadRes.fileUrl;
        let plainText = '';
        if (type === 'image') {
          plainText = `[IMAGE]:${fileUrl}`;
        } else {
          plainText = `[FILE]:${fileUrl}|${originalName}`;
        }

        const encryptedText = encryptMessage(plainText, chatId);
        if (socket) {
          socket.emit(
            'send_message',
            {
              chatId,
              recipientId,
              text: encryptedText,
            },
            (res: any) => {
              if (res && res.status === 'error') {
                Alert.alert('Error', 'Failed to send attachment.');
              }
            }
          );
        }
      } else {
        Alert.alert('Upload Failed', uploadRes?.message || 'Failed to upload attachment.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Permission to access photos is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        await uploadAndSendFile(uri, 'image', fileName, mimeType);
      }
    } catch (err) {
      console.error('Image picking error:', err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Permission to access the camera is required.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const fileName = asset.fileName || `camera_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        await uploadAndSendFile(uri, 'image', fileName, mimeType);
      }
    } catch (err) {
      console.error('Camera capture error:', err);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const fileName = asset.name || `file_${Date.now()}`;
        const mimeType = asset.mimeType || 'application/octet-stream';
        await uploadAndSendFile(uri, 'file', fileName, mimeType);
      }
    } catch (err) {
      console.error('Document picking error:', err);
    }
  };
  const handleReactMessage = (messageId: string, emoji: string) => {
    if (socket) {
      socket.emit('add_reaction', { chatId, messageId, emoji }, (response: any) => {
        if (response && response.status === 'success') {
          setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, reactions: response.reactions } : m))
          );
        }
      });
    }
    setSelectedMessageId(null);
  };

  const handleLongPressMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
  };

  useEffect(() => {
    fetchHistory();
  }, [chatId]);

  useEffect(() => {
    if (socket) {
      // Send initial read receipt
      socket.emit('read_receipt', { chatId, senderId: recipientId });

      // Request current online users to resolve race condition
      socket.emit('check_online', (usersList: string[]) => {
        setIsPeerOnline(usersList.includes(recipientId));
      });

      // Listen to presence updates to check if recipient is online
      socket.on('online_users_list', (usersList: string[]) => {
        setIsPeerOnline(usersList.includes(recipientId));
      });

      socket.on('presence_status', ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
        if (userId === recipientId) {
          setIsPeerOnline(status === 'online');
        }
      });

      return () => {
        socket.off('online_users_list');
        socket.off('presence_status');
      };
    }
  }, [socket, chatId, recipientId]);

  // Setup Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data: { chatId: string; message: any }) => {
      if (data.chatId === chatId) {
        const decryptedMessage = {
          ...data.message,
          text: decryptMessage(data.message.text, chatId),
        };
        setMessages((prev) => {
          // Prevent duplicate message keys in real-time
          if (prev.some((m) => m.id === decryptedMessage.id)) {
            return prev;
          }
          return [decryptedMessage, ...prev];
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

    const handleReactionUpdated = (data: { chatId: string; messageId: string; reactions: any[] }) => {
      if (data.chatId === chatId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing_status', handleTypingStatus);
    socket.on('messages_read_sync', handleReadSync);
    socket.on('message_reaction_updated', handleReactionUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing_status', handleTypingStatus);
      socket.off('messages_read_sync', handleReadSync);
      socket.off('message_reaction_updated', handleReactionUpdated);
    };
  }, [socket, chatId, recipientId]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const socket = getSocket();
    if (!socket || !isSocketConnected) {
      Alert.alert('Offline', 'Connection offline. Please wait for connection to restore.');
      return;
    }

    // Stop typing indicator
    if (isTypingRef.current) {
      socket.emit('typing', { chatId, recipientId, isTyping: false });
      isTypingRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    const encryptedText = encryptMessage(inputText.trim(), chatId);

    socket.emit(
      'send_message',
      {
        chatId,
        recipientId,
        text: encryptedText,
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
    const reactions = item.reactions || [];
    const reactionCounts = reactions.reduce((acc: Record<string, number>, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});
    const uniqueEmojis = Object.keys(reactionCounts);

    const isImage = item.text.startsWith('[IMAGE]:');
    const isFile = item.text.startsWith('[FILE]:');

    let imageUrl = '';
    if (isImage) {
      imageUrl = item.text.slice(8);
    }

    let fileUrl = '';
    let fileName = '';
    if (isFile) {
      const parts = item.text.slice(7).split('|');
      fileUrl = parts[0];
      fileName = parts[1] || 'attachment';
    }

    return (
      <View style={[styles.messageRow, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
        <TouchableOpacity
          onLongPress={() => handleLongPressMessage(item.id)}
          activeOpacity={0.9}
          style={[
            styles.bubble,
            {
              backgroundColor: isMe ? '#FFFFFF' : '#16161C',
              borderColor: isMe ? 'transparent' : 'rgba(255, 255, 255, 0.06)',
              borderWidth: 1,
              borderTopRightRadius: isMe ? 4 : 18,
              borderTopLeftRadius: isMe ? 18 : 4,
              borderRadius: 18,
              marginBottom: uniqueEmojis.length > 0 ? 12 : 4,
              paddingHorizontal: isImage ? 4 : 12,
              paddingVertical: isImage ? 4 : 8,
            },
          ]}
        >
          {isImage ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : isFile ? (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Download File', `Do you want to download or open: ${fileName}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open', onPress: () => {
                    const { Linking } = require('react-native');
                    Linking.openURL(fileUrl);
                  }}
                ]);
              }}
              style={styles.fileContainer}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text" size={32} color={isMe ? '#000000' : '#FFFFFF'} />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileNameText, { color: isMe ? '#000000' : '#FFFFFF' }]} numberOfLines={1}>
                  {fileName}
                </Text>
                <Text style={[styles.fileDownloadText, { color: isMe ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}>
                  Tap to Open
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.messageText, { color: isMe ? '#000000' : '#FFFFFF' }]}>
              {item.text}
            </Text>
          )}
          <View style={styles.bubbleMeta}>
            <Text style={[styles.timestamp, { color: isMe ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)' }]}>
              {formatMsgTime(item.timestamp)}
            </Text>
            {isMe && <View style={styles.statusWrapper}>{renderStatusIcon(item.status)}</View>}
          </View>

          {uniqueEmojis.length > 0 && (
            <View style={[
              styles.reactionBadge,
              isMe ? styles.reactionBadgeMe : styles.reactionBadgeOther
            ]}>
              <Text style={styles.reactionBadgeText}>
                {uniqueEmojis.join('')} {reactions.length > 1 ? reactions.length : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
              <Text style={[styles.headerStatus, { color: !isSocketConnected ? '#FF3B30' : isPeerTyping ? '#C5A880' : isPeerOnline ? '#4CD964' : colors.textSecondary }]}>
                {!isSocketConnected ? 'connecting...' : isPeerTyping ? 'typing...' : isPeerOnline ? 'online' : 'offline'}
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 60}
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
            <TouchableOpacity 
              onPress={() => setShowAttachmentMenu(true)}
              style={styles.attachButton}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={toggleEmojiPicker} 
              style={{ padding: 6, marginRight: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showEmojiPicker ? "keypad-outline" : "happy-outline"} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              onFocus={() => setShowEmojiPicker(false)}
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

        {showEmojiPicker && (
          <View style={[styles.emojiPickerContainer, { backgroundColor: '#121215', borderTopColor: 'rgba(255,255,255,0.06)', borderTopWidth: 1 }]}>
            <FlatList
              data={POPULAR_EMOJIS}
              keyExtractor={(item) => item}
              numColumns={8}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setInputText((prev) => prev + item)}
                  style={styles.emojiItem}
                  activeOpacity={0.6}
                >
                  <Text style={styles.emojiText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.emojiPickerContent}
            />
          </View>
        )}

        <Modal
          visible={selectedMessageId !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedMessageId(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedMessageId(null)}>
            <View style={styles.reactionOverlay}>
              <View style={[styles.reactionBubbleContainer, { backgroundColor: '#1C1C24' }]}>
                {REACTION_EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      if (selectedMessageId) {
                        handleReactMessage(selectedMessageId, emoji);
                      }
                    }}
                    style={styles.reactionBubbleBtn}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.reactionBubbleEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          visible={showAttachmentMenu}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAttachmentMenu(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowAttachmentMenu(false)}>
            <View style={styles.attachmentOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[styles.attachmentContainer, { backgroundColor: '#1C1C24' }]}>
                  <Text style={styles.attachmentTitle}>Send Attachment</Text>

                  <TouchableOpacity 
                    onPress={handlePickImage} 
                    style={styles.attachmentItem}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.attachmentIconWrapper, { backgroundColor: '#C5A880' }]}>
                      <Ionicons name="image-outline" size={24} color="#000000" />
                    </View>
                    <Text style={styles.attachmentText}>Photo Library</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleTakePhoto} 
                    style={styles.attachmentItem}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.attachmentIconWrapper, { backgroundColor: '#007AFF' }]}>
                      <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.attachmentText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handlePickDocument} 
                    style={styles.attachmentItem}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.attachmentIconWrapper, { backgroundColor: '#34C759' }]}>
                      <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.attachmentText}>Document / File</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setShowAttachmentMenu(false)} 
                    style={[styles.attachmentItem, { borderBottomWidth: 0, marginTop: 10 }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.attachmentText, { color: '#FF3B30', width: '100%', textAlign: 'center', fontWeight: '700' }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <View style={styles.uploadingCard}>
              <ActivityIndicator size="large" color="#FFFFFF" style={{ marginBottom: 12 }} />
              <Text style={styles.uploadingText}>Encrypting & Uploading...</Text>
            </View>
          </View>
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
  reactionBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  reactionBadgeMe: {
    right: 12,
  },
  reactionBadgeOther: {
    left: 12,
  },
  reactionBadgeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  emojiPickerContainer: {
    height: 250,
    width: '100%',
  },
  emojiPickerContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
  reactionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionBubbleContainer: {
    flexDirection: 'row',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reactionBubbleBtn: {
    paddingHorizontal: 10,
  },
  reactionBubbleEmoji: {
    fontSize: 28,
  },
  messageImage: {
    width: 220,
    height: 160,
    borderRadius: 14,
    marginBottom: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    maxWidth: 240,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileNameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileDownloadText: {
    fontSize: 11,
    marginTop: 2,
  },
  attachmentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  attachmentContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  attachmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  attachmentIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  attachmentText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  uploadingCard: {
    backgroundColor: '#1C1C24',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 10,
  },
});
