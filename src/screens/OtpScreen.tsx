import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export default function OtpScreen({ navigation, route }: Props) {
    const { phone, mode } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(30);
    const canVerify = otp.trim().length >= 4;
    const otpError = touched && !canVerify ? 'Enter valid OTP' : undefined;

    useEffect(() => {
        if (secondsLeft === 0) return;
        const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const handleVerify = () => {
        setTouched(true);
        if (!canVerify) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }, 550);
    };

    const resendOtp = () => {
        if (secondsLeft > 0) return;
        setSecondsLeft(30);
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Code sent to +91 {phone}</Text>
            <Text style={styles.modeText}>{mode === 'login' ? 'Login flow' : 'Register flow'}</Text>

            <FormInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Enter OTP"
                label="One-time password"
                error={otpError}
            />

            <PrimaryButton title="Verify and Enter" disabled={!canVerify} loading={loading} onPress={handleVerify} />

            <Pressable style={styles.resendWrap} disabled={secondsLeft > 0} onPress={resendOtp}>
                <Text style={[styles.resendText, secondsLeft > 0 && styles.resendDisabled]}>
                    {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : 'Resend OTP'}
                </Text>
            </Pressable>

            <Text style={styles.note}>Frontend only: OTP is mocked in UI.</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: 18,
        paddingTop: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.ink,
    },
    subtitle: {
        marginTop: 6,
        color: colors.muted,
    },
    modeText: {
        marginTop: 6,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 18,
    },
    resendWrap: {
        marginTop: 10,
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
        marginTop: 12,
        color: colors.muted,
        fontSize: 12,
    },
});
