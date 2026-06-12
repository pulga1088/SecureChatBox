import React, { createContext, useState, useContext, useEffect } from 'react';

// For a real app, you'd use SecureStore or AsyncStorage to persist the session
// import * as SecureStore from 'expo-secure-store';

type UserInfo = {
    id: string;
    phone: string;
    name?: string;
};

interface AuthContextType {
    user: UserInfo | null;
    isLoading: boolean;
    login: (phone: string, token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock loading session from SecureStore on startup
        const loadSession = async () => {
            try {
                // const storedUser = await SecureStore.getItemAsync('user_session');
                // if (storedUser) setUser(JSON.parse(storedUser));
                
                // For demo purposes, we will mock a slight delay
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                console.error('Failed to load session', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    const login = async (phone: string, token: string) => {
        // Integrate with your backend API here
        setIsLoading(true);
        try {
            const userInfo = { id: Math.random().toString(), phone };
            // await SecureStore.setItemAsync('user_session', JSON.stringify(userInfo));
            setUser(userInfo);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // await SecureStore.deleteItemAsync('user_session');
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
