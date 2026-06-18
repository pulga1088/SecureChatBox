import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export const SettingsScreen: React.FC = () => {
  const { colors, toggleTheme, isDark } = useTheme();
  const navigation = useNavigation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);

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
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Preference Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
          <View style={[
            styles.card,
            {
              backgroundColor: 'rgba(20, 20, 24, 0.55)',
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }
          ]}>
            {/* Dark Mode Row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#1A1A24', borderWidth: 1, borderColor: '#C5A880' }]}>
                  <Ionicons name="color-palette" size={18} color="#C5A880" />
                </View>
                <Text style={[styles.rowText, { color: '#FFFFFF' }]}>Obsidian Theme</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#C5A880' }}>Active</Text>
            </View>

            {/* Notifications Row */}
            <View style={[
              styles.row,
              {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: 'rgba(255, 255, 255, 0.06)',
              }
            ]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#222226', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
                  <Ionicons name="notifications" size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.rowText, { color: '#FFFFFF' }]}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#FFFFFF' }}
                thumbColor={Platform.OS === 'android' ? '#f4f3f4' : undefined}
              />
            </View>
          </View>

          {/* Security Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRIVACY & SECURITY</Text>
          <View style={[
            styles.card,
            {
              backgroundColor: 'rgba(20, 20, 24, 0.55)',
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }
          ]}>
            {/* Read Receipts Row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#222226', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
                  <Ionicons name="eye" size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.rowText, { color: '#FFFFFF' }]}>Read Receipts</Text>
              </View>
              <Switch
                value={readReceiptsEnabled}
                onValueChange={setReadReceiptsEnabled}
                trackColor={{ false: '#767577', true: '#FFFFFF' }}
                thumbColor={Platform.OS === 'android' ? '#f4f3f4' : undefined}
              />
            </View>
          </View>

          {/* E2E Info Card */}
          <View style={[
            styles.securityCard,
            {
              backgroundColor: 'rgba(197, 168, 128, 0.05)',
              borderColor: 'rgba(197, 168, 128, 0.15)',
            }
          ]}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#C5A880" />
              <Text style={[styles.securityTitle, { color: '#C5A880' }]}>End-to-End Encrypted</Text>
            </View>
            <Text style={[styles.securityText, { color: '#FFFFFF' }]}>
              All chats in Secure Chat are locked with dual-layer cryptography (AES-256 and RSA). Nobody outside this chat, not even the server network, can read your messages or see shared media files.
            </Text>
          </View>

          {/* System Information */}
          <View style={styles.appInfoContainer}>
            <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>Secure Chat v1.0.0 (Expo)</Text>
            <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>End-to-End Cryptography Certified</Text>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
  },
  securityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginTop: 8,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  appInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appInfoText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
});
export default SettingsScreen;
