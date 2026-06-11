import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, Pressable, SafeAreaView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const [phone, setPhone] = useState('');
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
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
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('Otp', { phone, mode: 'login' });
        }, 550);
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            <Animated.View style={{ transform: [{ translateY: slide }] }}>
                <Text style={styles.title}>Login</Text>
                <Text style={styles.subtitle}>Use your mobile number to receive OTP.</Text>

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

                <PrimaryButton title="Send OTP" loading={loading} disabled={!isValid} onPress={handleContinue} />
            </Animated.View>

            <Pressable style={styles.linkWrap} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Create new account</Text>
            </Pressable>
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
        marginBottom: 18,
    },
    linkWrap: {
        marginTop: 16,
        alignItems: 'center',
    },
    link: {
        color: colors.primary,
        fontWeight: '600',
    },
});
