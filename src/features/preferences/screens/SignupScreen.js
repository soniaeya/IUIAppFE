import React, { useState } from 'react';
import axios from "axios";

import {
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import styled from 'styled-components/native';
import { TextInput, Button, Text } from 'react-native-paper';

const Container = styled(SafeAreaView)`
    flex: 1;
    background-color: #dbbdab;
`;

const Inner = styled.View`
    flex: 1;
    padding: 24px;
    justify-content: center;
`;

const Header = styled.View`
    margin-bottom: 40px;
`;

const Title = styled(Text)`
    font-size: 32px;
    font-weight: 800;
    color: #5a2b67;
`;

const Subtitle = styled(Text)`
    margin-top: 8px;
    font-size: 16px;
    color: #6f4b63;
`;

const Card = styled.View`
    background-color: #ffffff;
    border-radius: 24px;
    padding: 24px;
    shadow-color: #000;
    shadow-opacity: 0.1;
    shadow-radius: 12px;
    shadow-offset: 0px 4px;
    elevation: 5;
`;

const FieldSpacer = styled.View`
    height: 16px;
`;

const Footer = styled.View`
    margin-top: 24px;
    align-items: center;
`;

const FooterText = styled(Text)`
    color: #6f4b63;
`;

const FooterLink = styled(Text)`
    color: #a8809b;
    font-weight: 700;
`;

const LogoBubble = styled.View`
    width: 72px;
    height: 72px;
    border-radius: 36px;
    background-color: #e4d1eb;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    align-self: center;
`;

const EmojiText = styled(Text)`
    font-size: 32px;
`;

export function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secure, setSecure] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://10.0.2.2:8000/signup", {
                name,
                email,
                password,
            });

            console.log("Signup response:", response.data);
            alert("Account created! You can now log in.");
            navigation?.navigate('LoginScreen');
        } catch (error) {
            console.log("Signup error:", error?.response?.data || error.message);

            if (error.response) {
                alert(error.response.data.detail || "Signup failed");
            } else {
                alert("Could not reach server");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <Inner>
                        <Header>
                            <LogoBubble buttonColor={"#6f4b63"}>
                                <EmojiText>🥋</EmojiText>
                            </LogoBubble>
                            <Title variant="headlineLarge">Create account</Title>
                            <Subtitle>
                                Sign up to find activities that match your mood.
                            </Subtitle>
                        </Header>

                        <Card>
                            <TextInput
                                label="Name"
                                mode="outlined"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                left={<TextInput.Icon icon="account-outline" />}
                            />

                            <FieldSpacer />

                            <TextInput
                                label="Email"
                                mode="outlined"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                left={<TextInput.Icon icon="email-outline" />}
                            />

                            <FieldSpacer />

                            <TextInput
                                label="Password"
                                mode="outlined"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={secure}
                                left={<TextInput.Icon icon="lock-outline" />}
                                right={
                                    <TextInput.Icon
                                        icon={secure ? 'eye-off-outline' : 'eye-outline'}
                                        onPress={() => setSecure(prev => !prev)}
                                    />
                                }
                            />

                            <FieldSpacer />

                            <TextInput
                                label="Confirm Password"
                                mode="outlined"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={secureConfirm}
                                left={<TextInput.Icon icon="lock-check-outline" />}
                                right={
                                    <TextInput.Icon
                                        icon={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
                                        onPress={() => setSecureConfirm(prev => !prev)}
                                    />
                                }
                            />

                            <FieldSpacer />

                            <Button
                                mode="contained"
                                onPress={handleSignup}
                                loading={loading}
                                disabled={
                                    loading ||
                                    !name ||
                                    !email ||
                                    !password ||
                                    !confirmPassword
                                }
                                style={{ borderRadius: 12, paddingVertical: 4 }}
                                buttonColor="#6f4b63"
                            >
                                Sign Up
                            </Button>
                        </Card>

                        <Footer>
                            <FooterText>
                                Already have an account?{' '}
                                <FooterLink onPress={() => navigation.navigate('LoginScreen')}>
                                    Log in
                                </FooterLink>
                            </FooterText>
                        </Footer>
                    </Inner>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Container>
    );
}

export default SignupScreen;
