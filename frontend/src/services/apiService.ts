import { Platform } from 'react-native';
import { getSession } from './firebaseAuth';

export const BACKEND_URL = 'https://suds-unjustly-polygon.ngrok-free.dev';

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

export const getUserProfile = async (userId: string) => {
  return fetchApi(`/api/users/${userId}`);
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

/**
 * Upload a file to the backend uploads server
 */
export const uploadFile = async (fileUri: string, mimeType: string, fileName: string): Promise<any> => {
  try {
    const session = await getSession();
    if (!session || !session.backendToken) {
      throw new Error('Authentication required');
    }

    // Convert file URI to Blob and File for compatibility with Expo SDK 56's WinterCG fetch
    const fileResponse = await fetch(fileUri);
    const blob = await fileResponse.blob();
    const file = new File([blob], fileName, { type: mimeType });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.backendToken}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    return await response.json();
  } catch (error: any) {
    console.error('File upload api error:', error);
    return { status: 'error', message: error.message || 'File upload failed' };
  }
};

export const deleteMessageApi = async (messageId: string) => {
  return fetchApi(`/api/chats/messages/${messageId}`, {
    method: 'DELETE',
  });
};

export const clearChatApi = async (chatId: string) => {
  return fetchApi(`/api/chats/${chatId}/messages`, {
    method: 'DELETE',
  });
};

export const deleteChatApi = async (chatId: string) => {
  return fetchApi(`/api/chats/${chatId}`, {
    method: 'DELETE',
  });
};
