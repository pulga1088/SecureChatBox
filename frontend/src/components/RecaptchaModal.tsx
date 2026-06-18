import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { firebaseConfig } from '../services/firebase';
import { useTheme } from '../theme/ThemeContext';

interface RecaptchaModalProps {
  visible: boolean;
  onClose: () => void;
  onVerify: (token: string) => void;
}

export const RecaptchaModal: React.FC<RecaptchaModalProps> = ({
  visible,
  onClose,
  onVerify,
}) => {
  const { colors } = useTheme();

  const handleMessage = (event: any) => {
    const data = event.nativeEvent.data;
    if (typeof data === 'string' && data.startsWith('recaptcha_success:')) {
      const token = data.replace('recaptcha_success:', '');
      onVerify(token);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: transparent;
          }
          .recaptcha-wrapper {
            transform: scale(1.1);
          }
        </style>
      </head>
      <body>
        <div class="recaptcha-wrapper">
          <div 
            class="g-recaptcha" 
            data-sitekey="6LcMZR0UAAAAALgPMcgHwga7gY5p8QMg1Hj-bmUv" 
            data-callback="onSuccess"
            data-expired-callback="onExpired"
            data-error-callback="onError"
          ></div>
        </div>
        <script>
          function onSuccess(token) {
            window.ReactNativeWebView.postMessage("recaptcha_success:" + token);
          }
          function onExpired() {
            window.ReactNativeWebView.postMessage("recaptcha_expired");
          }
          function onError() {
            window.ReactNativeWebView.postMessage("recaptcha_error");
          }
        </script>
      </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Security Check</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Webview */}
          <View style={styles.webviewContainer}>
            <WebView
              originWhitelist={['*']}
              source={{
                html: htmlContent,
                baseUrl: `https://${firebaseConfig.projectId}.firebaseapp.com`,
              }}
              onMessage={handleMessage}
              style={{ backgroundColor: 'transparent' }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode="always"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: 420,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  webviewContainer: {
    flex: 1,
    padding: 10,
  },
});
