import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;
import { BACKEND_URL } from '../services/apiService';

export const SplashScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);

  const checkSessionAndNavigate = async () => {
    try {
      const { getSession, clearSession } = require('../services/firebaseAuth');
      const session = await getSession();
      if (session && session.backendToken) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        try {
          // Validate backend JWT by fetching user profile details
          const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
            headers: {
              Authorization: `Bearer ${session.backendToken}`,
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (response.ok) {
            navigation.replace('Home');
          } else {
            // Token expired or invalid
            await clearSession();
            navigation.replace('Login');
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          await clearSession();
          navigation.replace('Login');
        }
      } else {
        navigation.replace('Login');
      }
    } catch (error) {
      navigation.replace('Login');
    }
  };

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(
      1.0,
      { duration: 1000 },
      (finished) => {
        if (finished) {
          scale.value = withDelay(
            800,
            withTiming(1.2, { duration: 400 })
          );
          opacity.value = withDelay(
            1200,
            withTiming(0, { duration: 400 })
          );
        }
      }
    );

    const navTimeout = setTimeout(() => {
      checkSessionAndNavigate();
    }, 2600);

    return () => clearTimeout(navTimeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030303', '#0A0A0C', '#121215']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <View style={[styles.iconWrapper, { backgroundColor: '#1A1A24', borderWidth: 1, borderColor: '#C5A880' }]}>
          <Ionicons name="shield-checkmark" size={60} color="#C5A880" />
        </View>
        <Text style={[styles.title, { color: '#FFFFFF' }]}>Secure Chat</Text>
        <Text style={[styles.subtitle, { color: '#C5A880' }]}>
          End-to-End Encrypted
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
