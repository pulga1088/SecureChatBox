import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { getSocket } from './src/services/socketService';
import { decryptMessage } from './src/services/encryptionService';

const navigationRef = createNavigationContainerRef();

const AppContent: React.FC = () => {
  const { mode } = useTheme();
  
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerData, setBannerData] = useState<{
    chatId: string;
    senderName: string;
    text: string;
    senderId: string;
  } | null>(null);

  const slideAnim = useRef(new Animated.Value(-120)).current;
  const bannerTimeoutRef = useRef<any>(null);
  const activeChatIdRef = useRef<string | null>(null);

  const handleStateChange = () => {
    if (navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute() as any;
      if (currentRoute?.name === 'Chat') {
        const params = currentRoute.params as any;
        activeChatIdRef.current = params?.chatId || null;
      } else {
        activeChatIdRef.current = null;
      }
    }
  };

  const showBanner = (data: typeof bannerData) => {
    setBannerData(data);
    setBannerVisible(true);
    
    // Slide down animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();

    // Auto-hide after 4 seconds
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    bannerTimeoutRef.current = setTimeout(() => {
      hideBanner();
    }, 4000);
  };

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setBannerVisible(false);
    });
  };

  const handleBannerTap = () => {
    if (bannerData && navigationRef.isReady()) {
      hideBanner();
      // Navigate to Chat screen
      (navigationRef as any).navigate('Chat', {
        chatId: bannerData.chatId,
        name: bannerData.senderName,
        recipientId: bannerData.senderId,
      });
    }
  };

  // Poll/Check for global socket connection and register listener
  useEffect(() => {
    let globalListenerRegistered = false;
    let registeredSocket: any = null;

    const handleGlobalMessage = (data: { chatId: string; message: any }) => {
      if (data.message.sender === 'me') return;
      
      // Show notification if user is NOT currently inside this chat
      if (activeChatIdRef.current !== data.chatId) {
        showBanner({
          chatId: data.chatId,
          senderName: data.message.senderName || 'New Message',
          text: decryptMessage(data.message.text, data.chatId),
          senderId: data.message.senderId,
        });
      }
    };

    const interval = setInterval(() => {
      const socket = getSocket();
      if (socket) {
        if (registeredSocket !== socket) {
          if (registeredSocket) {
            registeredSocket.off('receive_message', handleGlobalMessage);
          }
          socket.on('receive_message', handleGlobalMessage);
          registeredSocket = socket;
        }
      } else {
        registeredSocket = null;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (registeredSocket) {
        registeredSocket.off('receive_message', handleGlobalMessage);
      }
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef} onStateChange={handleStateChange}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />

      {/* Global In-App Banner */}
      {bannerVisible && bannerData && (
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: 'rgba(18, 18, 22, 0.95)',
              borderColor: 'rgba(197, 168, 128, 0.3)',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.bannerContent}
            onPress={handleBannerTap}
            activeOpacity={0.9}
          >
            <View style={styles.bannerIconBox}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#C5A880" />
            </View>
            <View style={styles.bannerTextBox}>
              <Text style={styles.bannerTitle} numberOfLines={1}>
                {bannerData.senderName}
              </Text>
              <Text style={styles.bannerText} numberOfLines={1}>
                {bannerData.text}
              </Text>
            </View>
            <TouchableOpacity onPress={hideBanner} style={styles.bannerCloseBtn}>
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 30, // Positioned safely below the status bar
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 9999,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(197, 168, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    color: '#C5A880',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
  },
  bannerCloseBtn: {
    padding: 6,
    marginLeft: 10,
  },
});
