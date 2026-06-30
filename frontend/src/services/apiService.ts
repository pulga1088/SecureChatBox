import { Platform } from 'react-native';
import { getSession } from './firebaseAuth';

export const BACKEND_URL = 'https://ckufm-49-37-214-111.free.pinggy.net';

/**
 * Generic API fetch wrapper that automatically appends the backend JWT auth token.
 */
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const session = await getSession();
  const token = (session as any)?.backendToken;

  const headers = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
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
