import React, { useState, useEffect } from 'react';
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
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { RecaptchaModal } from '../components/RecaptchaModal';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACKEND_URL } from '../services/apiService';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';



type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signInMethod, setSignInMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);

  // Animated glow spot variables
  const spot1X = useSharedValue(0);
  const spot1Y = useSharedValue(0);
  const spot2X = useSharedValue(0);
  const spot2Y = useSharedValue(0);
  const spot3X = useSharedValue(0);
  const spot3Y = useSharedValue(0);

  const submitScale = useSharedValue(1);

  const animSubmit = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
  }));

  const handleSubmitPressIn = () => {
    submitScale.value = withTiming(0.95, { duration: 100 });
  };

  const handleSubmitPressOut = () => {
    submitScale.value = withTiming(1, { duration: 100 });
  };

  useEffect(() => {
    spot1X.value = withRepeat(
      withSequence(
        withTiming(120, { duration: 10000 }),
        withTiming(-60, { duration: 8000 }),
        withTiming(0, { duration: 10000 })
      ),
      -1,
      true
    );
    spot1Y.value = withRepeat(
      withSequence(
        withTiming(180, { duration: 12000 }),
        withTiming(-80, { duration: 9000 }),
        withTiming(0, { duration: 11000 })
      ),
      -1,
      true
    );

    spot2X.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 11000 }),
        withTiming(80, { duration: 10000 }),
        withTiming(0, { duration: 9000 })
      ),
      -1,
      true
    );
    spot2Y.value = withRepeat(
      withSequence(
        withTiming(-160, { duration: 13000 }),
        withTiming(60, { duration: 8000 }),
        withTiming(0, { duration: 11000 })
      ),
      -1,
      true
    );

    spot3X.value = withRepeat(
      withSequence(
        withTiming(80, { duration: 9000 }),
        withTiming(-100, { duration: 11000 }),
        withTiming(0, { duration: 10000 })
      ),
      -1,
      true
    );
    spot3Y.value = withRepeat(
      withSequence(
        withTiming(-120, { duration: 11000 }),
        withTiming(120, { duration: 12000 }),
        withTiming(0, { duration: 9000 })
      ),
      -1,
      true
    );
  }, []);

  const animSpot1 = useAnimatedStyle(() => ({
    transform: [{ translateX: spot1X.value }, { translateY: spot1Y.value }],
  }));

  const animSpot2 = useAnimatedStyle(() => ({
    transform: [{ translateX: spot2X.value }, { translateY: spot2Y.value }],
  }));

  const animSpot3 = useAnimatedStyle(() => ({
    transform: [{ translateX: spot3X.value }, { translateY: spot3Y.value }],
  }));

  const handleEmailAuth = async () => {
    if (!isFormValid || isLoading) return;
    setIsLoading(true);
    Keyboard.dismiss();
    const isSignUpMode = authMode === 'signup';
    try {
      const { signUpWithEmail, signInWithEmail, saveSession } = require('../services/firebaseAuth');
      let session;
      if (isSignUpMode) {
        session = await signUpWithEmail(email.trim(), password);
      } else {
        session = await signInWithEmail(email.trim(), password);
      }

      let formattedPhone = phone.trim();
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
      }

      // Exchange Firebase ID Token for backend JWT
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: session.idToken,
          name: isSignUpMode ? name.trim() : undefined,
          phone: isSignUpMode && formattedPhone ? formattedPhone : undefined,
          location: isSignUpMode && locationStr.trim() ? locationStr.trim() : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
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
      Alert.alert(
        isSignUpMode ? 'Registration Failed' : 'Login Failed',
        error.message || 'An error occurred during authentication.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async (recaptchaToken: string) => {
    if (phone.trim().length < 10 || isLoading) return;
    setShowRecaptcha(false); // Close modal immediately after receiving token
    setIsLoading(true);
    Keyboard.dismiss();
    try {
      const { sendVerificationCode } = require('../services/firebaseAuth');
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
      }
      const sessionInfo = await sendVerificationCode(formattedPhone, recaptchaToken);
      navigation.navigate('OTP', {
        phoneNumber: formattedPhone,
        sessionInfo: sessionInfo,
      });
    } catch (error: any) {
      Alert.alert('OTP Request Failed', error.message || 'Could not send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (authMode === 'signup' || signInMethod === 'email') {
      handleEmailAuth();
    } else {
      setShowRecaptcha(true);
    }
  };

  const isFormValid = authMode === 'signup'
    ? name.trim().length > 0 &&
      email.includes('@') &&
      email.includes('.') &&
      password.length >= 6
    : signInMethod === 'email'
      ? email.includes('@') && email.includes('.') && password.length >= 6
      : phone.trim().length >= 10;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Looping Fluid Background Gradient Canvas */}
        <LinearGradient
          colors={['#030303', '#0A0A0C', '#121215']}
          style={StyleSheet.absoluteFill}
        >
          <Animated.View
            style={[
              styles.glowBlob,
              animSpot1,
              {
                backgroundColor: '#1E1B29', // Smoky dark purple
                left: -60,
                top: 100,
                opacity: 0.2,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowBlob,
              animSpot2,
              {
                backgroundColor: '#162224', // Smoky dark teal/grey
                right: -60,
                bottom: 120,
                opacity: 0.18,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowBlob,
              animSpot3,
              {
                backgroundColor: '#261921', // Smoky dark rose/charcoal
                left: 80,
                bottom: -60,
                opacity: 0.15,
              },
            ]}
          />
        </LinearGradient>

        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.content}>
              {/* Glossy Glassmorphism Card */}
              <View style={[
                styles.glassCard,
                {
                  backgroundColor: 'rgba(18, 18, 20, 0.65)',
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                }
              ]}>
                <View style={styles.header}>
                  <View style={[styles.logoBadge, { backgroundColor: 'rgba(197, 168, 128, 0.1)' }]}>
                    <Ionicons name="chatbubbles" size={32} color="#C5A880" />
                  </View>
                  <Text style={[styles.title, { color: '#FFFFFF' }]}>
                    {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {authMode === 'signup'
                      ? 'Sign up to start chatting.'
                      : 'Sign in to access your secure chats.'}
                  </Text>
                </View>

                <View style={styles.form}>
                  {authMode === 'signin' && (
                    <View style={styles.methodSelector}>
                      <TouchableOpacity
                        style={[styles.methodButton, signInMethod === 'email' && styles.methodActiveButton]}
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setSignInMethod('email');
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="mail"
                          size={16}
                          color={signInMethod === 'email' ? '#000000' : 'rgba(255, 255, 255, 0.5)'}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.methodText, signInMethod === 'email' && styles.methodActiveText]}>
                          Email
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.methodButton, signInMethod === 'phone' && styles.methodActiveButton]}
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setSignInMethod('phone');
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="call"
                          size={16}
                          color={signInMethod === 'phone' ? '#000000' : 'rgba(255, 255, 255, 0.5)'}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.methodText, signInMethod === 'phone' && styles.methodActiveText]}>
                          Phone / OTP
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {authMode === 'signup' && (
                    <View style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        borderColor: 'rgba(255,255,255,0.06)',
                      }
                    ]}>
                      <TextInput
                        style={[styles.inputField, { color: '#FFFFFF' }]}
                        placeholder="Full name"
                        placeholderTextColor={colors.placeholder}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                      />
                    </View>
                  )}

                  {(authMode === 'signup' || (authMode === 'signin' && signInMethod === 'email')) && (
                    <View style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        borderColor: 'rgba(255,255,255,0.06)',
                      }
                    ]}>
                      <TextInput
                        style={[styles.inputField, { color: '#FFFFFF' }]}
                        placeholder="Email address"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  )}

                  {(authMode === 'signup' || (authMode === 'signin' && signInMethod === 'phone')) && (
                    <View style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        borderColor: 'rgba(255,255,255,0.06)',
                      }
                    ]}>
                      <TextInput
                        style={[styles.inputField, { color: '#FFFFFF' }]}
                        placeholder={authMode === 'signup' ? "Phone number (optional)" : "Phone number (e.g. +91 98765 43210)"}
                        placeholderTextColor={colors.placeholder}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                      />
                    </View>
                  )}

                  {authMode === 'signup' && (
                    <View style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        borderColor: 'rgba(255,255,255,0.06)',
                      }
                    ]}>
                      <TextInput
                        style={[styles.inputField, { color: '#FFFFFF' }]}
                        placeholder="Location / Country (optional)"
                        placeholderTextColor={colors.placeholder}
                        value={locationStr}
                        onChangeText={setLocationStr}
                      />
                    </View>
                  )}

                  {(authMode === 'signup' || (authMode === 'signin' && signInMethod === 'email')) && (
                    <View style={[
                      styles.passwordWrapper, 
                      { 
                        borderColor: 'rgba(255,255,255,0.06)', 
                        backgroundColor: 'rgba(0,0,0,0.4)' 
                      }
                    ]}>
                      <TextInput
                        style={[styles.passwordInput, { color: '#FFFFFF' }]}
                        placeholder="Password"
                        placeholderTextColor={colors.placeholder}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.footer}>
                  <Animated.View style={animSubmit}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          backgroundColor: isFormValid ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                        },
                      ]}
                      disabled={!isFormValid || isLoading}
                      onPress={handleSubmit}
                      onPressIn={handleSubmitPressIn}
                      onPressOut={handleSubmitPressOut}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#000000" />
                      ) : (
                        <>
                          <Text style={[styles.buttonText, { color: isFormValid ? '#000000' : 'rgba(255,255,255,0.3)' }]}>
                            {authMode === 'signup' ? 'Sign Up' : signInMethod === 'email' ? 'Sign In' : 'Send OTP'}
                          </Text>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={isFormValid ? '#000000' : 'rgba(255,255,255,0.3)'}
                            style={styles.buttonIcon}
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  <TouchableOpacity
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    }}
                    style={styles.toggleLink}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.toggleLinkText, { color: '#C5A880' }]}>
                      {authMode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>

        <RecaptchaModal
          visible={showRecaptcha}
          onClose={() => setShowRecaptcha(false)}
          onVerify={handlePhoneAuth}
        />
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
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 4,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActiveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  tabActiveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  methodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  methodActiveButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  methodActiveText: {
    color: '#000000',
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
  },
  glowBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    marginVertical: 30,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  inputWrapper: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordWrapper: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
  },
  eyeIcon: {
    padding: 4,
  },
  footer: {
    marginBottom: 10,
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
  toggleLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  toggleLinkText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 350,
    backgroundColor: '#121214',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  recaptchaContainer: {
    width: 304,
    height: 600,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#121214',
  },
  webview: {
    flex: 1,
    width: 304,
    height: 600,
  },
});
