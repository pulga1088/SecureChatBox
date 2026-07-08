import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getUsers, getOrCreateChat } from '../services/apiService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewChat'>;

interface UserItem {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  status?: string;
}

export const NewChatScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const loadUsers = async (search = '') => {
    setIsLoading(true);
    try {
      const data = await getUsers(search);
      if (data.status === 'success' && data.users) {
        // Map backend _id to id
        const mappedUsers = data.users.map((u: any) => ({
          id: u._id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          profileImage: u.profileImage,
          status: u.status,
        }));
        setUsers(mappedUsers);
      }
    } catch (error: any) {
      console.error('Failed to search users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Debounce/Trigger search
    const delayDebounceFn = setTimeout(() => {
      loadUsers(text);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  };

  const handleSelectUser = async (user: UserItem) => {
    setIsSearching(true);
    try {
      const response = await getOrCreateChat(user.id);
      if (response.status === 'success' && response.chat) {
        // Replace current screen in stack with Chat Screen
        navigation.replace('Chat', {
          chatId: response.chat._id,
          name: user.name,
          recipientId: user.id,
        });
      } else {
        Alert.alert('Error', 'Unable to open conversation thread.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start chat session.');
    } finally {
      setIsSearching(false);
    }
  };

  const renderUserItem = ({ item }: { item: UserItem }) => {
    const avatarText = item.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <TouchableOpacity
        style={[
          styles.userItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          }
        ]}
        onPress={() => handleSelectUser(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border }]}>
          <Text style={styles.avatarText}>{avatarText}</Text>
        </View>

        {/* Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.userStatus, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.status || 'Hey there! I am using Secure Chat.'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top', 'bottom']}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[
            styles.searchBar,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
            }
          ]}>
            <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by name, phone or email..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); loadUsers(''); }}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* NFC Action Button */}
        <TouchableOpacity
          style={[
            styles.nfcBtn,
            {
              backgroundColor: colors.accentLight,
              borderColor: colors.accentBorder,
            }
          ]}
          onPress={() => navigation.navigate('NFCShare')}
        >
          <Ionicons name="radio" size={18} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={[styles.nfcBtnText, { color: colors.accent }]}>Start Secure Chat via NFC</Text>
        </TouchableOpacity>

        {/* Main List */}
        {isSearching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Opening secure chat...</Text>
          </View>
        ) : isLoading && users.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found</Text>
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
  userItem: {
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
  nfcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  nfcBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
