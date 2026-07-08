import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface NfcAuthContextType {
  isNfcUnlocked: boolean;
  unlockNfcSession: () => void;
  lockNfcSession: () => void;
}

const NfcAuthContext = createContext<NfcAuthContextType | undefined>(undefined);

const SECURE_SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export const NfcAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNfcUnlocked, setIsNfcUnlocked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lockNfcSession = () => {
    console.log('[NfcAuthContext] Secure session locked.');
    setIsNfcUnlocked(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const unlockNfcSession = () => {
    console.log('[NfcAuthContext] Secure session unlocked. 15-minute timer started.');
    setIsNfcUnlocked(true);
    
    // Clear any existing timer first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set auto-lock timer for 15 minutes
    timeoutRef.current = setTimeout(() => {
      console.log('[NfcAuthContext] 15-minute secure session expired. Auto-locking.');
      lockNfcSession();
    }, SECURE_SESSION_TIMEOUT);
  };

  // AppState Listener to lock application when backgrounded
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log(`[NfcAuthContext] App moved to ${nextAppState}. Terminating secure session.`);
        lockNfcSession();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <NfcAuthContext.Provider value={{ isNfcUnlocked, unlockNfcSession, lockNfcSession }}>
      {children}
    </NfcAuthContext.Provider>
  );
};

export const useNfcAuth = () => {
  const context = useContext(NfcAuthContext);
  if (context === undefined) {
    throw new Error('useNfcAuth must be used within an NfcAuthProvider');
  }
  return context;
};
