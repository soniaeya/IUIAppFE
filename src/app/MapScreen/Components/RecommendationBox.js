import styled from "styled-components/native";
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Image, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
const background_color = "white";
import StarRatingModal from "./StarRatingModal";

export default function RecommendationBox({
                                              expanded,
                                              userId,
                                              selectedLocation,
                                              onNextRecommendation,
                                              onPrevRecommendation,
                                              ratings,
                                              onSetRating,
                                              setExpanded,
                                              distanceKm,
                                          }) {
    const [ratingModalVisible, setRatingModalVisible] = useState(false);

    // 👉 No current selection yet: just show chevrons
    if (!selectedLocation) {
        return (
            <EmptyRecommendationContainer>
                <MaterialDesignIcons
                    name="chevron-right"
                    size={40}
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: -445,
                        zIndex: 999,
                    }}
                    onPress={() => {
                        onNextRecommendation();
                        setExpanded(prev => !prev);   // or !expanded
                    }}
                />

                <MaterialDesignIcons
                    name="chevron-left"
                    size={40}
                    style={{
                        position: "absolute",
                        left: 0,
                        bottom: -445,
                        zIndex: 999,
                    }}
                    onPress={() => {
                        onPrevRecommendation();
                        setExpanded(prev => !prev);
                    }}
                />
            </EmptyRecommendationContainer>
        );
    }

    const currentRating = ratings[selectedLocation?.placeId] || 0;
    const isOpenNow = selectedLocation?.isOpenNow;
    const openAtPreferred = selectedLocation?.openAtPreferredTime;

    return (
        <RecommendationContainer style={{ zIndex: 999, height: 300 }}>
            {/* NEXT */}
            <MaterialDesignIcons
                name="chevron-right"
                size={40}
                style={{
                    position: "absolute",
                    right: 0,
                    bottom: -75,
                    zIndex: 999,
                }}
                onPress={onNextRecommendation}
            />

            {/* PREV */}
            <MaterialDesignIcons
                name="chevron-left"
                size={40}
                style={{
                    position: "absolute",
                    left: 0,
                    bottom: -75,
                    zIndex: 999,
                }}
                onPress={onPrevRecommendation}
            />

            <RecommendationInfoContainer style={{ zIndex: 999, marginTop: 35 }}>
                <GymTitle>{selectedLocation.name}</GymTitle>

                <StatsContainer>
                    {/* Your rating (tap to edit) */}
                    <TouchableOpacity
                        style={{ zIndex: 999, position: "absolute" }}
                        onPress={() => {
                            if (!selectedLocation?.placeId) {
                                console.warn("Cannot rate: missing placeId");
                                return;
                            }
                            setRatingModalVisible(true);
                        }}
                    >
                        <StatsText>
                            Your Rating: {currentRating ? `${currentRating}★` : "No rating"}
                        </StatsText>
                    </TouchableOpacity>

                    <Text>{"\n"}</Text>

                    {/* Google user rating */}
                    <StatsText>User Rating</StatsText>:{' '}
                    {selectedLocation.rating} ★ ({selectedLocation.totalRatings})
                    {'\n'}

                    {/* Open / closed with preferred-time logic */}
                    <StatsText>Opened</StatsText>:{' '}
                    {isOpenNow && openAtPreferred === false ? (
                        <PreferredClosedText>
                            Open now, but closed at your preferred time
                        </PreferredClosedText>
                    ) : isOpenNow ? (
                        <OpenText>Open now</OpenText>
                    ) : openAtPreferred ? (
                        <PreferredOpenText>
                            Closed now, open at your preferred time
                        </PreferredOpenText>
                    ) : (
                        <CloseText>Closed</CloseText>
                    )}
                    {'\n'}

                    {/* Address */}
                    <StatsText>Address</StatsText>: {selectedLocation.address}
                    {'\n'}

                    {/* Phone */}
                    <StatsText>Tel</StatsText>: {selectedLocation.phone}
                    {'\n'}

                    {/* Distance */}
                    <StatsText>Distance: </StatsText>
                    {typeof distanceKm === "number" && (
                        <DistanceText>{distanceKm.toFixed(1)} km away</DistanceText>
                    )}
                </StatsContainer>
            </RecommendationInfoContainer>

            {/* Photo */}
            <ImageContainer style={{ zIndex: 999, marginTop: 30 }}>
                {selectedLocation.photo ? (
                    <Image
                        source={{ uri: selectedLocation.photo }}
                        style={{ width: "100%", height: 200, marginTop: 5, borderRadius: 20 }}
                    />
                ) : (
                    <Text style={{ padding: 10 }}>No photo available</Text>
                )}
            </ImageContainer>

            {/* Rating modal */}
            <StarRatingModal
                visible={ratingModalVisible}
                initialValue={currentRating || 0}
                userId={userId}
                placeId={selectedLocation?.placeId}
                gymName={selectedLocation?.name}
                onSubmit={(value) => onSetRating(selectedLocation.placeId, value)}
                onClose={() => setRatingModalVisible(false)}
            />
        </RecommendationContainer>
    );
}

// --- styles ---

const RecommendationContainer = styled.View`
    top: 70px;
    border-radius: 16px;
    height: 300px;
    width: 100%;
    background-color: white;
`;

const EmptyRecommendationContainer = styled.View`
    height: 0;
    width: 100%;
    background-color: blue;
`;

const RecommendationInfoContainer = styled.View`
    margin: 10px;
    z-index: 0;
    height: 200px;
    width: 40%;
    background-color: white;
`;

const GymTitle = styled.Text`
    font-family: "Roboto-Bold";
    font-weight: bold;
    font-size: 15px;
    padding: 10px;
    padding-bottom: 0px;
    line-height: 18px;
`;

const OpenText = styled.Text`
    font-family: "Roboto-Regular";
    font-size: 12px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
    color: darkolivegreen;
`;

const PreferredOpenText = styled.Text`
    font-family: "Roboto-Regular";
    font-size: 12px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
    color: #b8860b; /* golden-ish */
`;

const PreferredClosedText = styled.Text`
    font-family: "Roboto-Regular";
    font-size: 12px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
    color: #cc7000; /* warm orange for “warning” */
`;

const CloseText = styled.Text`
    font-family: "Roboto-Regular";
    font-size: 12px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
    color: darkred;
`;

const StatsText = styled.Text`
    font-family: "Roboto-Regular";
    font-size: 13px;
    font-weight: bold;
`;

const ImageContainer = styled.View`
    padding: 10px;
    position: absolute;
    left: 45%;
    height: 200px;
    width: 55%;
    background-color: ${background_color};
`;

const StatsContainer = styled.Text`
    font-family: "Roboto-Regular";
    font-size: 13px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
`;

const DistanceText = styled.Text`
    font-size: 14px;
    color: #555;
    margin-top: 4px;
`;
