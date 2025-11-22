import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";

const Background = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.4);
  justify-content: center;
  align-items: center;
`;

const Box = styled.View`
  width: 80%;
  background-color: white;
  padding: 24px;
  border-radius: 18px;
  elevation: 6;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #6f4b63;
  margin-bottom: 12px;
`;

const Message = styled.Text`
  font-size: 16px;
  color: #6f4b63;
  margin-bottom: 20px;
`;

const Button = styled.TouchableOpacity`
  align-self: flex-end;
  padding: 10px 16px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: #6f4b63;
  font-weight: 700;
`;

export default function CustomAlert({ visible, title, message, onClose }) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <Background>
                <Box>
                    <Title>{title}</Title>
                    <Message>{message}</Message>
                    <Button onPress={onClose}>
                        <ButtonText>OK</ButtonText>
                    </Button>
                </Box>
            </Background>
        </Modal>
    );
}
