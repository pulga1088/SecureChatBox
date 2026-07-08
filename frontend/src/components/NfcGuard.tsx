import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useNfcAuth } from '../context/NfcAuthContext';
import { getSession, saveSession, clearSession } from '../services/firebaseAuth';
import { BACKEND_URL } from '../services/apiService';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface NfcGuardProps {
  children: React.ReactNode;
  activeRoute: string;
}

export const NfcGuard: React.FC<NfcGuardProps> = ({ children, activeRoute }) => {
  const { colors } = useTheme();
  const { isNfcUnlocked, unlockNfcSession } = useNfcAuth();
  
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [statusText, setStatusText] = useState('Initializing NFC...');
  const [nfcError, setNfcError] = useState<string | null>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // NFC scanning flag to prevent concurrent requests
  const isScanningActive = useRef(false);
  const hasUnlocked = useRef(false);

  // Load session from AsyncStorage
  const loadSessionDetails = async () => {
    try {
      const session = await getSession();
      if (session && session.backendToken && session.user) {
        setSessionUser(session.user);
        setBackendToken(session.backendToken);
      } else {
        setSessionUser(null);
        setBackendToken(null);
      }
    } catch (e) {
      console.error('Error loading session in NfcGuard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionDetails();
  }, [activeRoute, isNfcUnlocked]);

  useEffect(() => {
    NfcManager.start().catch((err) => {
      console.warn('NfcManager start error in NfcGuard:', err);
    });
  }, []);

  // Pulse animation for the scanning visualizer
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (scanning) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
  }, [scanning]);

  // Main NFC listening loop
  const startNfcScanning = async () => {
    if (isScanningActive.current) return;
    isScanningActive.current = true;
    setScanning(true);
    setNfcError(null);
    setStatusText(
      sessionUser?.nfcRegistered
        ? 'Tap your registered NFC key against your device'
        : 'Tap a blank MIFARE card to link it as security key'
    );

    try {
      // 1. Enable NFC
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        setNfcError('NFC is disabled in system settings.');
        setStatusText('NFC is disabled.');
        setScanning(false);
        isScanningActive.current = false;
        return;
      }

      // 2. Request technology (supports standard ISO 14443-A tags via NfcA)
      await NfcManager.requestTechnology(NfcTech.NfcA);
      
      // 3. Read tag unique hardware ID (UID)
      const tag = await NfcManager.getTag();
      if (!tag || !tag.id) {
        throw new Error('Could not read NFC tag UID.');
      }

      const uid = tag.id;
      console.log('[NfcGuard] Scanned card UID:', uid);

      if (sessionUser?.nfcRegistered) {
        // --- Verification Flow ---
        setStatusText('Verifying security key...');
        const response = await fetch(`${BACKEND_URL}/api/auth/nfc/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify({ nfcUid: uid }),
        });

        const data = await response.json();
        if (!response.ok || data.status === 'error') {
          throw new Error(data.message || 'Verification failed. Incorrect NFC key.');
        }

        // Successfully verified
        hasUnlocked.current = true;
        unlockNfcSession();
      } else {
        // --- Registration Flow ---
        setStatusText('Registering hardware key...');
        const response = await fetch(`${BACKEND_URL}/api/auth/nfc/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${backendToken}`,
          },
          body: JSON.stringify({ nfcUid: uid }),
        });

        const data = await response.json();
        if (!response.ok || data.status === 'error') {
          throw new Error(data.message || 'Registration failed.');
        }

        // Update local session to mark card registered
        const currentSession = await getSession();
        if (currentSession && currentSession.user) {
          const updatedUser = { ...currentSession.user, nfcRegistered: true };
          await saveSession({
            ...currentSession,
            user: updatedUser,
          });
          setSessionUser(updatedUser);
        }

        Alert.alert('Key Registered', 'This NFC card is now linked to your secure chat account!');
        hasUnlocked.current = true;
        unlockNfcSession();
      }
    } catch (err: any) {
      console.warn('[NfcGuard] NFC Scanning Error:', err);
      // Don't show alert for user cancellation
      if (err !== 'cancelled' && err?.message !== 'cancelled') {
        setNfcError(err.message || 'An error occurred during NFC scan.');
      }
      setStatusText('Scan failed. Try tapping again.');
    } finally {
      // Clean up NFC technology request
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      setScanning(false);
      isScanningActive.current = false;
      
      // Auto-restart scanning loop if still locked and route requires guard
      const needsGuard = !(activeRoute === 'Splash' || activeRoute === 'Login' || activeRoute === 'OTP');
      if (needsGuard && !isNfcUnlocked && !hasUnlocked.current) {
        setTimeout(() => {
          startNfcScanning();
        }, 2500);
      }
    }
  };

  // Start scanning automatically if app is locked and logged in
  useEffect(() => {
    const needsGuard = !(activeRoute === 'Splash' || activeRoute === 'Login' || activeRoute === 'OTP');
    if (needsGuard && !isNfcUnlocked && sessionUser) {
      hasUnlocked.current = false;
      startNfcScanning();
    } else {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setScanning(false);
      isScanningActive.current = false;
    }

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, [activeRoute, isNfcUnlocked, sessionUser]);

  // AppState Listener to handle resuming from background
  useEffect(() => {
    const handleAppState = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const needsGuard = !(activeRoute === 'Splash' || activeRoute === 'Login' || activeRoute === 'OTP');
        if (needsGuard && !isNfcUnlocked && sessionUser) {
          console.log('[NfcGuard] App resumed. Re-initializing NFC scanning...');
          // Clean up old dead session first
          await NfcManager.cancelTechnologyRequest().catch(() => {});
          isScanningActive.current = false;
          hasUnlocked.current = false;
          // Start fresh scan
          startNfcScanning();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => {
      subscription.remove();
    };
  }, [activeRoute, isNfcUnlocked, sessionUser]);

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? You will need to verify with OTP next time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearSession();
            setSessionUser(null);
            setBackendToken(null);
          },
        },
      ]
    );
  };

  // 1. Loading state
  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const needsGuard = !(activeRoute === 'Splash' || activeRoute === 'Login' || activeRoute === 'OTP');

  // 2. Render normal screens if not logged in or unlocked
  if (!needsGuard || isNfcUnlocked || !sessionUser) {
    return <>{children}</>;
  }

  // 3. Render Lock Overlay Screen
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Branding */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={32} color={colors.accent} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>SECURE CHAT</Text>
        </View>

        {/* Center Content */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.shieldWrapper,
              {
                borderColor: nfcError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(197, 168, 128, 0.3)',
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={[styles.shieldInner, { backgroundColor: colors.card }]}>
              <Ionicons
                name={nfcError ? 'alert-circle' : sessionUser?.nfcRegistered ? 'key' : 'add-circle'}
                size={54}
                color={nfcError ? '#EF4444' : colors.accent}
              />
            </View>
          </Animated.View>

          <Text style={[styles.titleText, { color: colors.text }]}>
            {sessionUser?.nfcRegistered ? 'Hardware Key Required' : 'Register Hardware Key'}
          </Text>

          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            {sessionUser?.nfcRegistered
              ? 'This account is locked with a hardware possession factor. Please tap your registered NFC key to access your secure chats.'
              : 'Add an extra layer of security. Tap a blank NFC card against the back of your phone to register it as your personal hardware key.'}
          </Text>

          {/* Status Box */}
          <View style={[styles.statusBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
            {scanning && <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 10 }} />}
            <Text style={[styles.statusText, { color: colors.text }]}>
              {statusText}
            </Text>
          </View>

          {nfcError && (
            <TouchableOpacity
              onPress={() => startNfcScanning()}
              style={[styles.retryButton, { backgroundColor: colors.accent }]}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>Retry Scan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer fallback options */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>
        </View>
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  shieldWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  shieldInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 15,
    marginBottom: 35,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
