import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../constants/theme';
import { useResponsiveMetrics } from '../utils/responsive';
import { requestOtp } from '../services/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const ui = useResponsiveMetrics();
    const [phone, setPhone] = useState('');
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const slide = useMemo(() => new Animated.Value(20), []);

    React.useEffect(() => {
        Animated.timing(slide, { toValue: 0, duration: 350, useNativeDriver: true }).start();
    }, [slide]);

    const isValid = phone.trim().length === 10;
    const error = touched && !isValid ? 'Enter a valid 10-digit number' : undefined;

    const handleContinue = () => {
        setTouched(true);
        if (!isValid) return;
        setLoading(true);
        setApiError(null);
        requestOtp({ phone, mode: 'login' })
            .then((response) => {
                navigation.navigate('Otp', { phone, mode: 'login', verificationId: response.verificationId });
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
            <Animated.View style={{ transform: [{ translateY: slide }] }}>
            <Text style={[styles.title, { fontSize: ui.font(30) }]}>Login</Text>
            <Text style={[styles.subtitle, { marginTop: ui.spacing(6), marginBottom: ui.spacing(18), fontSize: ui.font(14) }]}>Use your mobile number to receive OTP.</Text>

                <FormInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="number-pad"
                    maxLength={10}
                    placeholder="Phone number"
                    prefix="+91"
                    label="Mobile Number"
                    error={error}
                />

                {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

                <PrimaryButton title="Send OTP" loading={loading} disabled={!isValid} onPress={handleContinue} />
            </Animated.View>

            <Pressable style={[styles.linkWrap, { marginTop: ui.spacing(16), paddingBottom: insets.bottom + ui.spacing(8) }]} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Create new account</Text>
            </Pressable>
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
    linkWrap: {
        alignItems: 'center',
    },
    link: {
        color: colors.primary,
        fontWeight: '600',
    },
    apiError: {
        color: '#C33C3C',
        marginBottom: 8,
    },
});
