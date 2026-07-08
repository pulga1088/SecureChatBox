import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { getSession } from '../services/firebaseAuth';
import { getOrCreateChat } from '../services/apiService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NFCShare'>;

export const NFCShareScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [statusText, setStatusText] = useState('Select an action below');
  const [isScanning, setIsScanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    // 1. Initialise NFC manager
    NfcManager.start()
      .then(() => NfcManager.isSupported())
      .then((supported) => setNfcSupported(supported))
      .catch((err) => {
        console.warn('NfcManager start error:', err);
        setNfcSupported(false);
      });

    // 2. Fetch current user session details
    getSession().then((session) => {
      if (session) {
        setCurrentUser({
          id: session.user?.id || (session.user as any)?._id || '',
          name: session.user?.name || '',
        });
      }
    });

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const handleStartScan = async () => {
    if (!nfcSupported) {
      Alert.alert('NFC Unsupported', 'This device does not support NFC.');
      return;
    }
    const enabled = await NfcManager.isEnabled();
    if (!enabled) {
      Alert.alert('NFC Disabled', 'Please enable NFC in your device settings.');
      return;
    }

    setIsScanning(true);
    setStatusText('Hold device close to NFC contact card...');

    try {
      // Listen to Ndef tags
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
        const ndefRecord = tag.ndefMessage[0];
        const textPayload = Ndef.text.decodePayload(ndefRecord.payload);
        const contactData = JSON.parse(textPayload);

        if (contactData && contactData.id && contactData.name) {
          setStatusText(`Profile found: ${contactData.name}. Initializing channel...`);
          
          const response = await getOrCreateChat(contactData.id);
          if (response.status === 'success' && response.chat) {
            // Success: navigate to the chat room
            navigation.replace('Chat', {
              chatId: response.chat._id,
              name: contactData.name,
              recipientId: contactData.id,
            });
          } else {
            Alert.alert('Error', 'Unable to negotiate secure cryptographic tunnel.');
            setStatusText('NFC negotiation failed.');
          }
        } else {
          Alert.alert('Invalid Tag', 'Scanned NFC tag does not contain a valid Secure Chat profile.');
          setStatusText('Invalid profile record format.');
        }
      } else {
        Alert.alert('Empty Tag', 'Scanned NFC tag has no payload record.');
        setStatusText('Read failed: Empty tag.');
      }
    } catch (ex: any) {
      console.warn('NFC Read Exception:', ex);
      setStatusText('NFC Scan cancelled/failed.');
    } finally {
      setIsScanning(false);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const handleStartWrite = async () => {
    if (!currentUser) {
      Alert.alert('Session Error', 'User session details not loaded.');
      return;
    }
    if (!nfcSupported) {
      Alert.alert('NFC Unsupported', 'This device does not support NFC.');
      return;
    }
    const enabled = await NfcManager.isEnabled();
    if (!enabled) {
      Alert.alert('NFC Disabled', 'Please enable NFC in your device settings.');
      return;
    }

    setIsWriting(true);
    setStatusText('Place your device near a writable NFC Tag...');

    try {
      const payloadString = JSON.stringify({
        id: currentUser.id,
        name: currentUser.name,
      });

      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(payloadString),
      ]);

      let writeSuccess = false;

      // 1. Try writing via standard Ndef first
      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        writeSuccess = true;
      } catch (ndefError: any) {
        console.warn('Standard NDEF write failed, attempting NdefFormatable...', ndefError.message || ndefError);
      } finally {
        await NfcManager.cancelTechnologyRequest().catch(() => {});
      }

      // 2. If Ndef write failed (common for blank/raw tags), try NdefFormatable
      if (!writeSuccess) {
        try {
          await NfcManager.requestTechnology(NfcTech.NdefFormatable);
          await NfcManager.ndefFormatableHandler.format(bytes);
          writeSuccess = true;
        } catch (formatError: any) {
          console.warn('NdefFormatable write/format failed:', formatError.message || formatError);
        } finally {
          await NfcManager.cancelTechnologyRequest().catch(() => {});
        }
      }

      if (writeSuccess) {
        setStatusText('Profile successfully written to NFC card!');
        Alert.alert('Success', 'Profile written successfully. You can now tap this card on another phone to start a secure chat!');
      } else {
        throw new Error('NFC tag is not writable with standard NDEF or NdefFormatable protocols.');
      }
    } catch (ex: any) {
      console.warn('NFC Write Exception:', ex);
      setStatusText('NFC Write failed/cancelled.');
      Alert.alert('Write Failed', ex.message || 'Unable to write profile data to the NFC tag.');
    } finally {
      setIsWriting(false);
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient as any}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>NFC Key Exchange</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.mainContent}>
          {/* NFC Status info */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons
              name={nfcSupported ? 'radio-outline' : 'warning-outline'}
              size={64}
              color={nfcSupported ? colors.accent : colors.danger}
              style={styles.nfcIcon}
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {nfcSupported === null
                ? 'Initializing...'
                : nfcSupported
                ? 'NFC Contact Exchange'
                : 'NFC Unsupported'}
            </Text>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {statusText}
            </Text>

            {(isScanning || isWriting) && (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 12 }} />
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.accent, opacity: isScanning || isWriting ? 0.6 : 1 },
              ]}
              disabled={isScanning || isWriting}
              onPress={handleStartScan}
            >
              <Ionicons name="scan-outline" size={20} color="#050505" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Scan Contact NFC Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonSecondary,
                {
                  borderColor: colors.accent,
                  opacity: isScanning || isWriting ? 0.6 : 1,
                },
              ]}
              disabled={isScanning || isWriting}
              onPress={handleStartWrite}
            >
              <Ionicons name="create-outline" size={20} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.buttonSecondaryText, { color: colors.accent }]}>
                Write Profile to NFC Card
              </Text>
            </TouchableOpacity>
          </View>
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 40,
  },
  nfcIcon: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#050505',
  },
  buttonSecondary: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
