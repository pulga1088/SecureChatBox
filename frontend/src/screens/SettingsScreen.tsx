import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useNfcAuth } from '../context/NfcAuthContext';
import { getSession } from '../services/firebaseAuth';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export const SettingsScreen: React.FC = () => {
  const { mode, colors, toggleTheme, isDark } = useTheme();
  const navigation = useNavigation();

  const { lockNfcSession } = useNfcAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  const [nfcRegistered, setNfcRegistered] = useState(false);

  useEffect(() => {
    const loadNfcStatus = async () => {
      const session = await getSession();
      if (session?.user) {
        setNfcRegistered(!!session.user.nfcRegistered);
      }
    };
    loadNfcStatus();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={[
          styles.header,
          {
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          }
        ]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Preference Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
          <View style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            }
          ]}>
            {/* Active Theme Cycle Row */}
            <TouchableOpacity onPress={toggleTheme} style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.accentLight, borderWidth: 1, borderColor: colors.accent }]}>
                  <Ionicons name="color-palette" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.rowText, { color: colors.text }]}>Theme</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.accent, textTransform: 'capitalize' }}>
                {mode}
              </Text>
            </TouchableOpacity>

            {/* Notifications Row */}
            <View style={[
              styles.row,
              {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              }
            ]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border }]}>
                  <Ionicons name="notifications" size={18} color={colors.icon} />
                </View>
                <Text style={[styles.rowText, { color: colors.text }]}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: colors.accent }}
                thumbColor={Platform.OS === 'android' ? '#f4f3f4' : undefined}
              />
            </View>
          </View>

          {/* Security Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRIVACY & SECURITY</Text>
          <View style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            }
          ]}>
            {/* Read Receipts Row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border }]}>
                  <Ionicons name="eye" size={18} color={colors.icon} />
                </View>
                <Text style={[styles.rowText, { color: colors.text }]}>Read Receipts</Text>
              </View>
              <Switch
                value={readReceiptsEnabled}
                onValueChange={setReadReceiptsEnabled}
                trackColor={{ false: '#767577', true: colors.accent }}
                thumbColor={Platform.OS === 'android' ? '#f4f3f4' : undefined}
              />
            </View>

            {/* NFC Key Exchange Row */}
            <TouchableOpacity
              onPress={() => navigation.navigate('NFCShare' as never)}
              style={[
                styles.row,
                {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                }
              ]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.accentLight, borderWidth: 1, borderColor: colors.accent }]}>
                  <Ionicons name="radio" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.rowText, { color: colors.text }]}>NFC Key Exchange</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Security Section */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY</Text>
          <View style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            }
          ]}>
            {/* Hardware Key Status Row */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.accentLight, borderWidth: 1, borderColor: colors.accent }]}>
                  <Ionicons name="key" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.rowText, { color: colors.text }]}>Hardware Security Key</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: nfcRegistered ? colors.accent : colors.textSecondary }}>
                {nfcRegistered ? 'Registered' : 'Not Registered'}
              </Text>
            </View>

            {/* Manual Lock Row */}
            <TouchableOpacity
              onPress={() => {
                lockNfcSession();
                Alert.alert('App Locked', 'Your secure session has been terminated. Please scan your card to enter.');
              }}
              style={[
                styles.row,
                {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                }
              ]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed" size={18} color={colors.icon} />
                </View>
                <Text style={[styles.rowText, { color: colors.text }]}>Lock Secure Session</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* E2E Info Card */}
          <View style={[
            styles.securityCard,
            {
              backgroundColor: colors.accentLight,
              borderColor: colors.accentBorder,
            }
          ]}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={24} color={colors.accent} />
              <Text style={[styles.securityTitle, { color: colors.accent }]}>End-to-End Encrypted</Text>
            </View>
            <Text style={[styles.securityText, { color: colors.text }]}>
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
