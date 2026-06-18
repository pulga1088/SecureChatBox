import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebase';

const API_KEY = firebaseConfig.apiKey;
const SESSION_KEY = '@secure_chat_user_session';

export interface UserSession {
  uid: string;
  phoneNumber?: string;
  email?: string;
  idToken: string;
  backendToken?: string;
  user?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    location?: string;
    profileImage: string;
    status: string;
  };
}

/**
 * Sends an SMS OTP verification code to a phone number.
 * For local testing, add a test phone number in the Firebase Console (Auth > Sign-in Method > Phone).
 * Firebase Console testing bypasses Recaptcha checks automatically for registered test numbers.
 */
export const sendVerificationCode = async (phoneNumber: string, recaptchaToken?: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          recaptchaToken: recaptchaToken || 'test_recaptcha_token_fallback',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Failed to send SMS OTP';
      throw new Error(errMsg);
    }

    return data.sessionInfo; // Return the session token used to verify the code
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

/**
 * Verifies the SMS OTP code and signs the user in.
 */
export const verifyOTPCode = async (sessionInfo: string, code: string): Promise<UserSession> => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionInfo,
          code,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Invalid SMS verification code';
      throw new Error(errMsg);
    }

    return {
      uid: data.localId,
      idToken: data.idToken,
      phoneNumber: data.phoneNumber,
    };
  } catch (error: any) {
    console.error('Error verifying OTP code:', error);
    throw error;
  }
};

/**
 * Persists the user session locally.
 */
export const saveSession = async (session: UserSession): Promise<void> => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

/**
 * Retrieves the persisted user session.
 */
export const getSession = async (): Promise<UserSession | null> => {
  const sessionData = await AsyncStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};

/**
 * Clears the user session (signs out).
 */
export const clearSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

/**
 * Signs up a user with email and password using Firebase Auth REST API.
 */
export const signUpWithEmail = async (email: string, password: string): Promise<UserSession> => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Failed to sign up with email';
      throw new Error(errMsg);
    }

    return {
      uid: data.localId,
      idToken: data.idToken,
      email: data.email,
    };
  } catch (error: any) {
    console.error('Error in signUpWithEmail:', error);
    throw error;
  }
};

/**
 * Signs in a user with email and password using Firebase Auth REST API.
 */
export const signInWithEmail = async (email: string, password: string): Promise<UserSession> => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Failed to sign in with email';
      throw new Error(errMsg);
    }

    return {
      uid: data.localId,
      idToken: data.idToken,
      email: data.email,
    };
  } catch (error: any) {
    console.error('Error in signInWithEmail:', error);
    throw error;
  }
};
