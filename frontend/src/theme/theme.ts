export const theme = {
  colors: {
    light: {
      background: '#F2F2F7',
      gradient: ['#F5F5F7', '#E5E5EA', '#D1D1D6'],
      surface: '#FFFFFF',
      headerBackground: 'rgba(255, 255, 255, 0.85)',
      primary: '#1C1C1E',
      success: '#34C759',
      warning: '#FF9500',
      danger: '#FF3B30',
      text: '#1C1C1E',
      textSecondary: '#636366',
      border: 'rgba(0, 0, 0, 0.08)',
      placeholder: 'rgba(0, 0, 0, 0.35)',
      bubbleSent: '#007AFF', // iOS blue
      bubbleSentText: '#FFFFFF',
      bubbleReceived: '#E5E5EA', // iOS light gray
      bubbleReceivedText: '#1C1C1E',
      card: '#FFFFFF',
      input: 'rgba(0, 0, 0, 0.03)',
      icon: '#1C1C1E',
      accent: '#007AFF',
      accentLight: 'rgba(0, 122, 255, 0.05)',
      accentBorder: 'rgba(0, 122, 255, 0.15)',
      notification: '#FF3B30',
    },
    dark: {
      background: '#050505',
      gradient: ['#030303', '#0A0A0C', '#121215'],
      surface: 'rgba(20, 20, 24, 0.55)',
      headerBackground: 'rgba(18, 18, 20, 0.65)',
      primary: '#FFFFFF',
      success: '#C5A880', // Premium bronze/gold accent
      warning: '#E5C494',
      danger: '#FF4D4D',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      border: 'rgba(255, 255, 255, 0.08)',
      placeholder: 'rgba(255, 255, 255, 0.3)',
      bubbleSent: '#FFFFFF', // Sent: White bubble, black text
      bubbleSentText: '#000000',
      bubbleReceived: '#16161C', // Received: Charcoal bubble, white text
      bubbleReceivedText: '#FFFFFF',
      card: 'rgba(20, 20, 24, 0.55)',
      input: 'rgba(255, 255, 255, 0.03)',
      icon: '#FFFFFF',
      accent: '#C5A880',
      accentLight: 'rgba(197, 168, 128, 0.05)',
      accentBorder: 'rgba(197, 168, 128, 0.15)',
      notification: '#C5A880',
    },
    obsidian: {
      background: '#000000',
      gradient: ['#000000', '#000000', '#08080a'],
      surface: '#0D0D10',
      headerBackground: 'rgba(0, 0, 0, 0.85)',
      primary: '#FFFFFF',
      success: '#8E2DE2', // Premium purple accent
      warning: '#F2A900',
      danger: '#FF3333',
      text: '#FFFFFF',
      textSecondary: '#7C7C82',
      border: 'rgba(255, 255, 255, 0.04)',
      placeholder: 'rgba(255, 255, 255, 0.2)',
      bubbleSent: '#4A3C6B', // Deep obsidian purple
      bubbleSentText: '#FFFFFF',
      bubbleReceived: '#131317', // Very dark grey
      bubbleReceivedText: '#FFFFFF',
      card: '#09090b',
      input: '#09090b',
      icon: '#FFFFFF',
      accent: '#9F86FF', // Neon purple
      accentLight: 'rgba(159, 134, 255, 0.05)',
      accentBorder: 'rgba(159, 134, 255, 0.15)',
      notification: '#9F86FF',
    }
  }
};

export type ThemeType = typeof theme;
