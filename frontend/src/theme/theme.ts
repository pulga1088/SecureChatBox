export const theme = {
  colors: {
    light: {
      background: '#050505',
      surface: '#121214',
      primary: '#FFFFFF',
      success: '#C5A880', // Premium bronze/gold accent
      warning: '#E5C494',
      danger: '#FF4D4D',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      border: 'rgba(255, 255, 255, 0.08)',
      placeholder: 'rgba(255, 255, 255, 0.3)',
      bubbleSent: '#FFFFFF', // Sent: White bubble, black text
      bubbleReceived: '#16161C', // Received: Charcoal bubble, white text
      card: '#121214',
      notification: '#C5A880',
    },
    dark: {
      background: '#050505',
      surface: '#121214',
      primary: '#FFFFFF',
      success: '#C5A880', // Premium bronze/gold accent
      warning: '#E5C494',
      danger: '#FF4D4D',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      border: 'rgba(255, 255, 255, 0.08)',
      placeholder: 'rgba(255, 255, 255, 0.3)',
      bubbleSent: '#FFFFFF', // Sent: White bubble, black text
      bubbleReceived: '#16161C', // Received: Charcoal bubble, white text
      card: '#121214',
      notification: '#C5A880',
    }
  }
};

export type ThemeType = typeof theme;

