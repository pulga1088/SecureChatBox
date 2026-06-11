import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const canContinue = name.trim().length >= 2 && phone.trim().length === 10;

    const nameError = touched && name.trim().length < 2 ? 'Enter your full name' : undefined;
    const phoneError = touched && phone.trim().length !== 10 ? 'Enter a valid 10-digit number' : undefined;

    const handleContinue = () => {
        setTouched(true);
        if (!canContinue) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('Otp', { phone, mode: 'register' });
        }, 550);
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar style="dark" />
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Create your profile for frontend demo.</Text>

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

            <PrimaryButton title="Continue" disabled={!canContinue} loading={loading} onPress={handleContinue} />
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
});
