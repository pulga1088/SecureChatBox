import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const editScale = useRef(new Animated.Value(1)).current;
  const logoutScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (scaleVar: Animated.Value) => {
    Animated.spring(scaleVar, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 150,
      friction: 5,
    }).start();
  };

  const handlePressOut = (scaleVar: Animated.Value) => {
    Animated.spring(scaleVar, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 5,
    }).start();
  };

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { getSession } = require('../services/firebaseAuth');
        const session = await getSession();
        if (session && session.user) {
          setName(session.user.name || '');
          setStatus(session.user.status || '');
          setPhone(session.user.phone || '');
          setEmail(session.user.email || '');
          setLocation(session.user.location || '');
        }
      } catch (error) {
        console.error('Failed to load profile from session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (name.trim() === '') {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    try {
      const { updateProfile } = require('../services/apiService');
      const { getSession, saveSession } = require('../services/firebaseAuth');
      
      const response = await updateProfile(name.trim(), status.trim(), location.trim());
      
      if (response && response.status === 'success') {
        const session = await getSession();
        if (session) {
          await saveSession({
            ...session,
            user: {
              ...session.user,
              name: response.user.name,
              status: response.user.status,
              phone: response.user.phone,
              email: response.user.email,
              location: response.user.location,
              id: response.user.id || response.user._id || session.user?.id,
              profileImage: response.user.profileImage,
            }
          });
        }
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile on backend');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of Secure Chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { clearSession } = require('../services/firebaseAuth');
              const { disconnectSocket } = require('../services/socketService');
              await clearSession();
              disconnectSocket();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error clearing session:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getInitials = (userName: string) => {
    if (!userName) return 'U';
    const parts = userName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#030303', '#0A0A0C', '#121215']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['bottom']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030303', '#0A0A0C', '#121215']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={[
          styles.header,
          {
            backgroundColor: 'rgba(18, 18, 20, 0.65)',
            borderBottomColor: 'rgba(255, 255, 255, 0.06)',
          }
        ]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Profile</Text>
          <Animated.View style={{ transform: [{ scale: editScale }] }}>
            <TouchableOpacity
              onPressIn={() => handlePressIn(editScale)}
              onPressOut={() => handlePressOut(editScale)}
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.headerAction, { color: '#C5A880' }]}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: '#222226', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
                <TouchableOpacity style={[
                  styles.editAvatarBtn,
                  {
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                  }
                ]}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>NAME</Text>
                {isEditing ? (
                  <View style={[
                    styles.valueBox,
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }
                  ]}>
                    <TextInput
                      style={[styles.input, { color: '#FFFFFF' }]}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter name"
                      placeholderTextColor={colors.placeholder}
                      maxLength={30}
                      autoCorrect={false}
                    />
                  </View>
                ) : (
                  <View style={[
                    styles.valueBox,
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }
                  ]}>
                    <Text style={[styles.valueText, { color: '#FFFFFF' }]} numberOfLines={1}>{name}</Text>
                  </View>
                )}
              </View>

              {/* About / Status Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>ABOUT</Text>
                {isEditing ? (
                  <View style={[
                    styles.valueBox,
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }
                  ]}>
                    <TextInput
                      style={[styles.input, { color: '#FFFFFF' }]}
                      value={status}
                      onChangeText={setStatus}
                      placeholder="Enter status"
                      placeholderTextColor={colors.placeholder}
                      maxLength={100}
                      autoCorrect={false}
                    />
                  </View>
                ) : (
                  <View style={[
                    styles.valueBox,
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }
                  ]}>
                    <Text style={[styles.valueText, { color: '#FFFFFF' }]} numberOfLines={1}>{status}</Text>
                  </View>
                )}
              </View>

              {/* Location Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>LOCATION</Text>
                {isEditing ? (
                  <View style={[
                    styles.valueBox,
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }
                  ]}>
                    <TextInput
                      style={[styles.input, { color: '#FFFFFF' }]}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Enter location"
                      placeholderTextColor={colors.placeholder}
                      maxLength={50}
                      autoCorrect={false}
                    />
                  </View>
                ) : (
                  <View style={[
                    styles.valueBox,
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }
                  ]}>
                    <Text style={[styles.valueText, { color: '#FFFFFF' }]} numberOfLines={1}>{location || 'Not specified'}</Text>
                  </View>
                )}
              </View>

              {/* Phone Number Input (Read-only) */}
              {phone ? (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>PHONE NUMBER</Text>
                  <View style={[
                    styles.valueBox,
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      borderColor: 'rgba(255, 255, 255, 0.03)',
                    }
                  ]}>
                    <Text style={[styles.valueText, { color: colors.textSecondary }]} numberOfLines={1}>{phone}</Text>
                    <Ionicons name="lock-closed" size={14} color={colors.textSecondary} style={styles.lockIcon} />
                  </View>
                </View>
              ) : null}

              {/* Email Input (Read-only) */}
              {email ? (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
                  <View style={[
                    styles.valueBox,
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      borderColor: 'rgba(255, 255, 255, 0.03)',
                    }
                  ]}>
                    <Text style={[styles.valueText, { color: colors.textSecondary }]} numberOfLines={1}>{email}</Text>
                    <Ionicons name="lock-closed" size={14} color={colors.textSecondary} style={styles.lockIcon} />
                  </View>
                </View>
              ) : null}
            </View>

            {/* Logout Button */}
            <Animated.View style={{ transform: [{ scale: logoutScale }] }}>
              <TouchableOpacity
                onPressIn={() => handlePressIn(logoutScale)}
                onPressOut={() => handlePressOut(logoutScale)}
                style={[
                  styles.logoutBtn,
                  {
                    backgroundColor: 'rgba(255, 77, 77, 0.05)',
                    borderColor: 'rgba(255, 77, 77, 0.12)',
                  }
                ]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
              </TouchableOpacity>
            </Animated.View>
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  form: {
    flex: 1,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  valueBox: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
  },
  lockIcon: {
    marginLeft: 8,
  },
  logoutBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
