import { Platform } from 'react-native';
import { getSession } from './firebaseAuth';

// ──────────────────────────────────────────────────────────────────
// BACKEND_URL — pick the right one for your setup:
//   • Android Emulator (AVD):  'http://10.0.2.2:5000'
//   • Physical device / WiFi:  'http://<YOUR_MACHINE_IP>:5000'
// Find your machine's IP by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux).
// ──────────────────────────────────────────────────────────────────
export const BACKEND_URL = 'http://10.58.232.189:5000';

/**
 * Generic API fetch wrapper with timeout and automatic JWT auth token.
 */
export const fetchApi = async (endpoint: string, options: RequestInit = {}, timeout = 15000) => {
  const session = await getSession();
  const token = (session as any)?.backendToken;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const headers = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check if the backend server is running and accessible.');
    }
    throw error;
  }
};

/**
 * Users API
 */
export const getUsers = async (search?: string) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchApi(`/api/users${query}`);
};

export const updateProfile = async (name: string, status: string, location?: string, profileImage?: string) => {
  return fetchApi('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, status, location, profileImage }),
  });
};

/**
 * Chats API
 */
export const getChats = async () => {
  return fetchApi('/api/chats');
};

export const getOrCreateChat = async (recipientId: string) => {
  return fetchApi('/api/chats', {
    method: 'POST',
    body: JSON.stringify({ recipientId }),
  });
};

export const getMessages = async (chatId: string) => {
  return fetchApi(`/api/chats/${chatId}/messages`);
};
