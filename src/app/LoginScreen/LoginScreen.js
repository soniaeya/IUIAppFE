import React, { useState } from 'react';
import axios from "axios";

import {
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard, Alert,
} from 'react-native';
import styled from 'styled-components/native';
import { TextInput, Button, Text } from 'react-native-paper';
const Container = styled(SafeAreaView)`
    flex: 1;
    background-color: #dbbdab;
`;

const Inner = styled.View`
    flex: 1;
    top: -30px;
    padding: 24px;
    justify-content: center;
`;

const Header = styled.View`
    margin-bottom: 40px;
`;

const Title = styled(Text)`
    font-size: 32px;
    font-weight: 800;
    top: -10px;
    color: #5a2b67;
`;

const Subtitle = styled(Text)`
    margin-top: 8px;
    font-size: 16px;
    top: -10px;
    color: #6f4b63;
`;

const Card = styled.View`
    top: -10px;
    background-color: #ffffff;
    border-radius: 24px;
    padding: 24px;
    shadow-color: #000;
    shadow-opacity: 0.1;
    shadow-radius: 12px;
    shadow-offset: 0px 4px;
    height: 280px;
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
    color: #6f4b63;
    font-weight: 700;
`;

const LogoBubble = styled.View`
    width: 72px;
    height: 72px;
    border-radius: 36px;
    background-color: #f2d8ff;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    align-self: center;
`;

const EmojiText = styled(Text)`
    font-size: 32px;
`;

export function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://10.0.2.2:8000/login", {
                email,
                password,
            });

            console.log("Login response:", response.data);

            const { user_id, email: userEmail } = response.data;

            // Just to confirm:
            console.log("Logged in user_id:", user_id);

            Alert.alert("Login successful!");

            navigation.navigate('UserPreferencesScreen', {
                userId: user_id,
            });

        } catch (error) {
            console.log("Login error:", error?.response?.data || error.message);

            if (error.response) {
                Alert.alert(error.response.data.detail || "Login failed");
            } else {
                Alert.alert("Could not reach server");
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
                            <LogoBubble>
                                <EmojiText>🥋</EmojiText>
                            </LogoBubble>
                            <Title variant="headlineLarge">Welcome back</Title>
                            <Subtitle>Log in to find activities that match your mood.</Subtitle>
                        </Header>

                        <Card>
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
                                        onPress={() => setSecure((prev) => !prev)}
                                    />
                                }
                            />

                            <FieldSpacer />

                            <Button
                                mode="contained"
                                onPress={handleLogin}
                                loading={loading}
                                disabled={loading || !email || !password}
                                style={{ borderRadius: 12, paddingVertical: 4, bottom: -40}}
                                buttonColor="#6f4b63"
                            >
                                Log In
                            </Button>


                        </Card>

                        <Footer>
                            <FooterText>
                                Don&apos;t have an account?{' '}
                                <FooterLink onPress={() => navigation.navigate("SignupScreen")}>
                                    Sign up
                                </FooterLink>
                            </FooterText>
                        </Footer>
                    </Inner>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Container>
    );
}

export default LoginScreen;
