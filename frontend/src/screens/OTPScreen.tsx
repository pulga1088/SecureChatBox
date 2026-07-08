import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACKEND_URL } from '../services/apiService';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTP'>;
type OTPRouteProp = RouteProp<RootStackParamList, 'OTP'>;

export const OTPScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OTPRouteProp>();
  const { phoneNumber, sessionInfo } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Import verifyOTPCode and saveSession dynamically to avoid bundle cycles
  const { verifyOTPCode, saveSession } = require('../services/firebaseAuth');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    const sanitizedText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = sanitizedText;
    setOtp(newOtp);

    // Auto-focus next input if value entered
    if (sanitizedText !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all digits are filled
    const completedOtp = newOtp.join('');
    if (completedOtp.length === 6) {
      handleVerify(completedOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async (code: string = otp.join('')) => {
    if (code.length < 6 || isVerifying) return;
    setIsVerifying(true);
    try {
      const session = await verifyOTPCode(sessionInfo, code);

      // Exchange Firebase ID Token for backend JWT
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: session.idToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to authenticate with backend server');
      }

      // Save full session containing backend info
      await saveSession({
        ...session,
        backendToken: data.token,
        user: data.user,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'The verification code entered is incorrect.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(60);
    setOtp(Array(6).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient
          colors={colors.gradient as any}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={[styles.backButton, { backgroundColor: colors.input, borderColor: colors.border }]}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.icon} />
                </TouchableOpacity>

                <Text style={[styles.title, { color: colors.text }]}>Verify Phone</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  We've sent a 6-digit verification code to
                </Text>
                <Text style={[styles.phoneNumber, { color: colors.accent }]}>{phoneNumber}</Text>
              </View>

              <View style={styles.otpSection}>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { inputRefs.current[index] = ref; }}
                      style={[
                        styles.otpBox,
                        {
                          backgroundColor: colors.input,
                          borderColor: digit ? colors.accent : colors.border,
                          color: colors.text,
                        },
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleChangeText(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {/* Timer/Resend Section */}
                <View style={styles.timerRow}>
                  {timer > 0 ? (
                    <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                      Resend code in <Text style={{ color: colors.text, fontWeight: '700' }}>0:{timer < 10 ? `0${timer}` : timer}</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                      <Text style={[styles.resendText, { color: colors.accent }]}>Resend Verification Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: otp.join('').length === 6 ? colors.accent : colors.border,
                    },
                  ]}
                  disabled={otp.join('').length < 6 || isVerifying}
                  onPress={() => handleVerify()}
                  activeOpacity={0.8}
                >
                  {isVerifying ? (
                    <ActivityIndicator size="small" color={colors.bubbleSentText} />
                  ) : (
                    <>
                      <Text style={[styles.buttonText, { color: otp.join('').length === 6 ? colors.bubbleSentText : colors.placeholder }]}>Verify</Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={otp.join('').length === 6 ? colors.bubbleSentText : colors.placeholder}
                        style={styles.buttonIcon}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpSection: {
    marginVertical: 40,
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    justifyContent: 'center',
  },
  timerRow: {
    marginTop: 24,
  },
  timerText: {
    fontSize: 14,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginBottom: 24,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
