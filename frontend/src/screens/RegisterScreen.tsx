import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [touched, setTouched] = useState({ name: false, phone: false });
    const [loading, setLoading] = useState(false);

    const isNameValid = name.trim().length >= 3;
    const isPhoneValid = phone.trim().length === 10;
    const isValid = isNameValid && isPhoneValid;

    const handleContinue = () => {
        setTouched({ name: true, phone: true });
        if (!isValid) return;
        
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('Otp', { phone, name, mode: 'register' });
        }, 600);
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Animated.View entering={FadeInDown.duration(600).springify().damping(15)}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Let's set up your profile.</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(15)}>
                    <FormInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Satoshi Nakamoto"
                        label="Full Name"
                        error={touched.name && !isNameValid ? 'Enter a valid name (min 3 chars)' : undefined}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(600).springify().damping(15)} style={{ marginTop: 12 }}>
                    <FormInput
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="number-pad"
                        maxLength={10}
                        placeholder="Phone number"
                        prefix="+91"
                        label="Mobile Number"
                        error={touched.phone && !isPhoneValid ? 'Enter a valid 10-digit number' : undefined}
                    />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).duration(600).springify().damping(15)}>
                    <PrimaryButton title="Send OTP" loading={loading} disabled={!isValid} onPress={handleContinue} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400).duration(600).springify()}>
                    <Pressable style={styles.linkWrap} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Log in</Text></Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F7F9FA',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
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
    linkText: {
        color: colors.muted,
        fontSize: 15,
    },
    linkBold: {
        color: '#10A381',
        fontWeight: '700',
    },
});
