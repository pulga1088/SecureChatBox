import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useResponsiveMetrics } from '../utils/responsive';
import { requestOtp, verifyOtp } from '../services/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export default function OtpScreen({ navigation, route }: Props) {
    const insets = useSafeAreaInsets();
    const ui = useResponsiveMetrics();
    const { phone, mode, verificationId: initialVerificationId } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);
    const [verificationId, setVerificationId] = useState(initialVerificationId);
    const [secondsLeft, setSecondsLeft] = useState(30);
    const [apiError, setApiError] = useState<string | null>(null);
    const { login } = useAuth();
    const canVerify = otp.trim().length >= 4;
    const otpError = touched && !canVerify ? 'Enter valid OTP' : undefined;

    useEffect(() => {
        if (secondsLeft === 0) return;
        const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const handleVerify = async () => {
        setTouched(true);
        if (!canVerify) return;
        setLoading(true);
        setApiError(null);

        try {
            const response = await verifyOtp({ phone, verificationId, otp: otp.trim() });
            await login(response.user, response.token);
        } catch (error: unknown) {
            setApiError(error instanceof Error ? error.message : 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (secondsLeft > 0) return;
        setLoading(true);
        setApiError(null);

        try {
            const response = await requestOtp({ phone, mode });
            setVerificationId(response.verificationId);
            setOtp('');
            setSecondsLeft(30);
        } catch (error: unknown) {
            setApiError(error instanceof Error ? error.message : 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.root, { paddingTop: Math.max(insets.top, ui.spacing(10)), paddingHorizontal: ui.spacing(18) }]}>
            <StatusBar style="dark" />
            <Text style={[styles.title, { fontSize: ui.font(30) }]}>Verify OTP</Text>
            <Text style={[styles.subtitle, { marginTop: ui.spacing(6), fontSize: ui.font(14) }]}>Code sent to +91 {phone}</Text>
            <Text style={[styles.modeText, { marginTop: ui.spacing(6), marginBottom: ui.spacing(18), fontSize: ui.font(14) }]}>{mode === 'login' ? 'Login flow' : 'Register flow'}</Text>

            <FormInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Enter OTP"
                label="One-time password"
                error={otpError}
            />

            {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

            <PrimaryButton title="Verify and Enter" disabled={!canVerify} loading={loading} onPress={handleVerify} />

            <Pressable style={[styles.resendWrap, { marginTop: ui.spacing(12) }]} disabled={secondsLeft > 0} onPress={resendOtp}>
                <Text style={[styles.resendText, secondsLeft > 0 && styles.resendDisabled]}>
                    {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : 'Resend OTP'}
                </Text>
            </Pressable>

            <Text style={[styles.note, { marginTop: ui.spacing(12), fontSize: ui.font(12), paddingBottom: insets.bottom + ui.spacing(8) }]}>Check the server terminal for the OTP code during development.</Text>
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
    modeText: {
        color: colors.primary,
        fontWeight: '600',
    },
    resendWrap: {
        alignItems: 'center',
    },
    resendText: {
        color: colors.primary,
        fontWeight: '600',
    },
    resendDisabled: {
        color: '#90A4AE',
    },
    note: {
        color: colors.muted,
    },
    apiError: {
        color: '#C33C3C',
        marginBottom: 8,
    },
});
