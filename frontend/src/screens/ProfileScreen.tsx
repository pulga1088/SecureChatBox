import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, StyleSheet, Text, View, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import Avatar from '../components/Avatar';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const settings = [
    { id: '1', title: 'Privacy', subtitle: 'Last seen, profile photo, about', icon: 'shield-checkmark' as const, actions: ['My Contacts', 'Nobody', 'Everyone'] },
    { id: '2', title: 'Security', subtitle: 'Encryption key verified', icon: 'lock-closed' as const, actions: ['View Public Key', 'Regenerate Keys'] },
    { id: '3', title: 'Storage', subtitle: '1.2 GB used', icon: 'archive' as const, actions: ['Clear Cache', 'Manage Storage'] },
    { id: '4', title: 'Notifications', subtitle: 'Message tone and vibration', icon: 'notifications' as const, actions: ['Mute All', 'Change Tone', 'Vibrate Pattern'] },
];

export default function ProfileScreen({ navigation }: Props) {
    const { user, logout } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [activeSetting, setActiveSetting] = useState<typeof settings[0] | null>(null);

    const handleSettingPress = (item: typeof settings[0]) => {
        setActiveSetting(item);
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color={colors.ink} />
                </Pressable>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <View style={styles.topSection}>
                <Avatar name={user?.name || "Aditya"} color={colors.primary} size={82} />
                <Text style={styles.name}>{user?.name || "Aditya"}</Text>
                <Text style={styles.number}>+91 {user?.phone || '98765 43210'}</Text>
            </View>

            <View style={styles.settingsList}>
                {settings.map((item) => (
                    <Pressable 
                        key={item.id} 
                        style={({ pressed }) => [
                            styles.card,
                            pressed && { backgroundColor: '#F0F4F7', transform: [{ scale: 0.98 }] }
                        ]}
                        onPress={() => handleSettingPress(item)}
                    >
                        <View style={styles.cardIconWrap}>
                            <Ionicons name={item.icon} size={20} color={colors.primary} />
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardValue}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                    </Pressable>
                ))}
            </View>

            <View style={{ marginTop: 'auto', paddingBottom: 20 }}>
                <PrimaryButton 
                    title="Log Out securely" 
                    onPress={logout} 
                    style={{ backgroundColor: '#D9534F' }}
                />
            </View>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                    <View style={styles.modalDragBar} />
                    <Text style={styles.modalTitle}>{activeSetting?.title} Settings</Text>
                    {activeSetting?.actions.map((action, idx) => (
                        <Pressable 
                            key={idx} 
                            style={({ pressed }) => [
                                styles.modalOption,
                                pressed && { backgroundColor: '#F0F4F7' }
                            ]}
                            onPress={() => {
                                alert(`"${action}" setting saved!`);
                                setModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalOptionText}>{action}</Text>
                            <Ionicons name="checkmark-circle-outline" size={20} color={colors.muted} />
                        </Pressable>
                    ))}
                    <Pressable style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Cancel</Text>
                    </Pressable>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.ink,
    },
    topSection: {
        marginTop: 10,
        alignItems: 'center',
        marginBottom: 24,
    },
    name: {
        marginTop: 12,
        color: colors.ink,
        fontSize: 24,
        fontWeight: '700',
    },
    number: {
        marginTop: 4,
        color: colors.muted,
        fontSize: 16,
    },
    settingsList: {
        gap: 12,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.stroke,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E9F5F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        color: colors.ink,
        fontWeight: '700',
        fontSize: 17,
    },
    cardValue: {
        marginTop: 4,
        color: colors.muted,
        fontSize: 13,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    modalDragBar: {
        width: 40,
        height: 4,
        backgroundColor: '#DCE3E8',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.ink,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.stroke,
    },
    modalOptionText: {
        fontSize: 16,
        color: colors.ink,
        fontWeight: '500',
    },
    modalCloseButton: {
        marginTop: 16,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderRadius: 14,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D9534F',
    },
});
