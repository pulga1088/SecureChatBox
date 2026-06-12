import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

type UserInfo = {
    id: string;
    phone: string;
    name?: string;
    publicKey?: string;
};

interface AuthContextType {
    user: UserInfo | null;
    isLoading: boolean;
    login: (phone: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            try {
                // Permanently load user session so they don't have to login again!
                const storedUser = await AsyncStorage.getItem('@user_session');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load session', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    const login = async (phone: string) => {
        setIsLoading(true);
        try {
            const mockPublicKey = `PUB_KEY_${Math.random().toString(36).substring(7)}`;

            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, publicKey: mockPublicKey })
            });

            if (!response.ok) {
                throw new Error('Failed to verify OTP with server');
            }

            const data = await response.json();
            
            const loggedInUser = {
                id: data.user.id,
                phone: data.user.phone,
                name: data.user.name,
                publicKey: data.user.publicKey
            };

            // Save to permanent storage
            await AsyncStorage.setItem('@user_session', JSON.stringify(loggedInUser));
            setUser(loggedInUser);

        } catch (error) {
            console.error('Login error:', error);
            alert('Could not connect to server. Make sure the backend is running!');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('@user_session');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
