
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import styled from "styled-components/native";
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";

const highlight = "#6f4b63";

export default function LoadingRecommendation() {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [fadeAnim]);

  return (
    <Container>
      <AnimatedCard style={{ opacity: fadeAnim }}>
        <PlaceholderTitle />
        <PlaceholderLine width="80%" />
        <PlaceholderLine width="60%" />
        <PlaceholderLine width="40%" />
      </AnimatedCard>

      <ChevronRight>
        <MaterialDesignIcons
          name="chevron-right"
          size={40}
          color={highlight}
        />
      </ChevronRight>

      <ChevronLeft>
        <MaterialDesignIcons
          name="chevron-left"
          size={40}
          color={highlight}
        />
      </ChevronLeft>
    </Container>
  );
}

const Container = styled.View`
  width: 100%;
  height: 180px;
  justify-content: center;
  align-items: center;
`;

const AnimatedCard = styled(Animated.View)`
  width: 90%;
  height: 150px;
  background: white;
  border-radius: 22px;
  padding: 20px;
  justify-content: space-between;
  shadow-color: black;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
`;

const PlaceholderTitle = styled.View`
  width: 70%;
  height: 22px;
  background: #d8c9d3;
  border-radius: 10px;
`;

const PlaceholderLine = styled.View`
  height: 15px;
  background: #e3d6df;
  border-radius: 10px;
  margin-top: 10px;
  width: ${({ width }) => width};
`;

const ChevronRight = styled.View`
  position: absolute;
  right: 0px;
  bottom: -30px;
`;

const ChevronLeft = styled.View`
  position: absolute;
  left: 0px;
  bottom: -30px;
`;