import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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
            <View style={styles.container}>
                <Animated.View entering={FadeInDown.duration(600).springify().damping(15)}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Enter your phone number to sign in securely.</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(15)}>
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
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(600).springify().damping(15)}>
                    <PrimaryButton title="Send OTP" loading={loading} disabled={!isValid} onPress={handleContinue} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).duration(600).springify()}>
                    <Pressable style={styles.linkWrap} onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.link}>Create new account</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F7F9FA',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: colors.ink,
        letterSpacing: -0.5,
    },
    subtitle: {
        marginTop: 8,
        color: colors.muted,
        marginBottom: 32,
        fontSize: 15,
    },
    linkWrap: {
        marginTop: 24,
        alignItems: 'center',
    },
    link: {
        color: '#10A381',
        fontWeight: '700',
        fontSize: 15,
    },
});
