import 'react-native-gesture-handler';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppNavigator />
      </ChatProvider>
    </AuthProvider>
  );
}
