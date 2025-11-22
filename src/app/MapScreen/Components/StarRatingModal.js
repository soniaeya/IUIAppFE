import React, { useEffect, useRef, useState } from "react";
import { Modal, Animated, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

const highlight = "#6f4b63";

const Backdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
`;

const Box = styled.View`
  width: 80%;
  background-color: white;
  border-radius: 20px;
  padding: 20px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${highlight};
  margin-bottom: 8px;
`;

const Subtitle = styled.Text`
  font-size: 14px;
  color: ${highlight};
  margin-bottom: 16px;
`;

const StarsRow = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-bottom: 16px;
`;

const ButtonsRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  margin-top: 8px;
`;

const Button = styled.TouchableOpacity`
  padding-vertical: 10px;
  padding-horizontal: 16px;
  margin-left: 8px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${highlight};
`;

// ---------- Animated Star ----------
function AnimatedStar({ index, filled, onPress }) {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (filled) {
            Animated.sequence([
                Animated.spring(scale, {
                    toValue: 1.4,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [filled, scale]);

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale }] }}>
                <MaterialIcons
                    name={filled ? "star" : "star-outline"}
                    size={36}
                    color={filled ? "#f1c40f" : "#c0c0c0"}
                />
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function StarRatingModal({
                                            visible,
                                            initialValue = 0,
                                            title = "Rate this place",
                                            subtitle = "Tap a star from 1 to 5",
                                            onSubmit,
                                            onClose,
                                        }) {
    const [rating, setRating] = useState(initialValue);

    useEffect(() => {
        if (visible) {
            setRating(initialValue || 0);
        }
    }, [visible, initialValue]);

    const handleConfirm = () => {
        if (onSubmit) onSubmit(rating);
        if (onClose) onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <Backdrop>
                <Box>
                    <Title>{title}</Title>
                    <Subtitle>{subtitle}</Subtitle>

                    <StarsRow>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <AnimatedStar
                                key={num}
                                index={num}
                                filled={rating >= num}
                                onPress={() => setRating(num)}
                            />
                        ))}
                    </StarsRow>

                    <ButtonsRow>
                        <Button onPress={onClose}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button onPress={handleConfirm}>
                            <ButtonText>OK ({rating || "?"})</ButtonText>
                        </Button>
                    </ButtonsRow>
                </Box>
            </Backdrop>
        </Modal>
    );
}
