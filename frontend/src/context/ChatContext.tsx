import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '../constants/config';

export type ChatMessage = {
    id: string;
    text: string;
    mine: boolean;
    time: string;
    status: 'sent' | 'delivered' | 'read';
    recipientId: string;
};

interface ChatContextType {
    messages: ChatMessage[];
    typingUsers: string[];
    sendMessage: (receiverId: string, text: string) => void;
    sendTyping: (receiverId: string, isTyping: boolean) => void;
    markAsRead: (senderId: string) => void;
    connected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Only connect to Socket if user is logged in
        if (!user) return;

        const newSocket = io(API_URL);

        newSocket.on('connect', () => {
            console.log('🔗 Connected to Socket.io server');
            setConnected(true);
            newSocket.emit('register', user.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from Socket.io server');
            setConnected(false);
        });

        newSocket.on('receive_message', (data: any) => {
            // Received a message from someone else
            const incomingMsg: ChatMessage = {
                id: data._id || Math.random().toString(),
                text: data.content, // Normally you would decrypt this here!
                mine: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'delivered',
                recipientId: data.senderId, // The person who sent it is our contact
            };
            setMessages((prev) => [...prev, incomingMsg]);
        });
        
        newSocket.on('message_status', (data: any) => {
            // Update UI when a message is successfully delivered
            setMessages(prev => prev.map(msg => 
                msg.id === data.messageId ? { ...msg, status: data.status } : msg
            ));
        });

        newSocket.on('messages_read', (data: { readerId: string }) => {
            // The person we sent messages to just read them (Double Blue Ticks!)
            setMessages(prev => prev.map(msg => 
                (msg.recipientId === data.readerId && msg.mine) ? { ...msg, status: 'read' } : msg
            ));
        });

        newSocket.on('typing', (data: { senderId: string }) => {
            setTypingUsers(prev => Array.from(new Set([...prev, data.senderId])));
        });

        newSocket.on('stop_typing', (data: { senderId: string }) => {
            setTypingUsers(prev => prev.filter(id => id !== data.senderId));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const sendMessage = (receiverId: string, text: string) => {
        if (!socket || !user) return;

        // Optimistically show message in UI
        const tempId = Math.random().toString();
        const outgoingMsg: ChatMessage = {
            id: tempId,
            text,
            mine: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            recipientId: receiverId, // Who we are chatting with
        };
        setMessages((prev) => [...prev, outgoingMsg]);

        // Emit to server
        socket.emit('send_message', {
            senderId: user.id,
            receiverId: receiverId,
            content: text, // In reality, this would be encrypted FIRST with the receiver's public key
        });
    };

    const sendTyping = (receiverId: string, isTyping: boolean) => {
        if (!socket || !user) return;
        socket.emit(isTyping ? 'typing' : 'stop_typing', {
            senderId: user.id,
            receiverId
        });
    };

    const markAsRead = (senderId: string) => {
        if (!socket || !user) return;
        socket.emit('mark_read', {
            senderId: senderId,    // The person who sent the messages
            receiverId: user.id    // We are the ones reading it
        });

        // Optimistically update our local state to 'read' if it wasn't ours
        setMessages(prev => prev.map(msg => 
            (msg.recipientId === senderId && !msg.mine) ? { ...msg, status: 'read' } : msg
        ));
    };

    return (
        <ChatContext.Provider value={{ messages, typingUsers, sendMessage, sendTyping, markAsRead, connected }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
