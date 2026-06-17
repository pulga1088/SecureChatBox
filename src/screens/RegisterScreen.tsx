import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../constants/theme';
import { useResponsiveMetrics } from '../utils/responsive';
import { requestOtp } from '../services/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const ui = useResponsiveMetrics();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const canContinue = name.trim().length >= 2 && phone.trim().length === 10;

    const nameError = touched && name.trim().length < 2 ? 'Enter your full name' : undefined;
    const phoneError = touched && phone.trim().length !== 10 ? 'Enter a valid 10-digit number' : undefined;

    const handleContinue = () => {
        setTouched(true);
        if (!canContinue) return;
        setLoading(true);
        setApiError(null);
        requestOtp({ phone, mode: 'register', name: name.trim() })
            .then((response) => {
                navigation.navigate('Otp', { phone, mode: 'register', verificationId: response.verificationId });
            })
            .catch((error: unknown) => {
                setApiError(error instanceof Error ? error.message : 'Failed to request OTP');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <SafeAreaView style={[styles.root, { paddingTop: Math.max(insets.top, ui.spacing(10)), paddingHorizontal: ui.spacing(18) }]}>
            <StatusBar style="dark" />
            <Text style={[styles.title, { fontSize: ui.font(30) }]}>Register</Text>
            <Text style={[styles.subtitle, { marginTop: ui.spacing(6), marginBottom: ui.spacing(18), fontSize: ui.font(14) }]}>Create your profile for frontend demo.</Text>

            <FormInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                label="Name"
                error={nameError}
            />
            <FormInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="Phone number"
                prefix="+91"
                label="Mobile Number"
                error={phoneError}
            />

            {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

            <PrimaryButton title="Continue" disabled={!canContinue} loading={loading} onPress={handleContinue} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    title: {
        fontWeight: '700',
        color: colors.ink,
    },
    subtitle: {
        color: colors.muted,
    },
    apiError: {
        color: '#C33C3C',
        marginBottom: 8,
    },
});
