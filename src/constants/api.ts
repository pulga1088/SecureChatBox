import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

function resolveExpoHostBaseUrl() {
	const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;

	if (!hostUri) {
		return null;
	}

	const [host] = hostUri.split(':');

	if (!host) {
		return null;
	}

	return `http://${host}:3000`;
}

export const API_BASE_URL = configuredBaseUrl ?? resolveExpoHostBaseUrl() ?? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');