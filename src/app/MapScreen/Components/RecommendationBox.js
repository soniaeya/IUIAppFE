import styled from "styled-components/native";
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {Image, Text, TouchableOpacity} from "react-native";
import React, {useEffect, useState} from "react";
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
                                              distanceKm,              // ⭐ NEW
                                          }) {


    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    if (!selectedLocation) {

        return (<EmptyRecommendationContainer>

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
                    setExpanded(prev => !prev);   // or !expanded if you prefer
                }}
            />

            {/* PREV */}
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
                    setExpanded(prev => !prev);   // or !expanded if you prefer
                }}
            />

        </EmptyRecommendationContainer>)
    }
    const userRatingForThisPlace = ratings[selectedLocation.placeId];
    const currentRating = ratings[selectedLocation?.placeId] || 0;


    if (selectedLocation && selectedLocation.isOpenNow === false) {
        return (
            <EmptyRecommendationContainer>
                {/* You can show arrows so the user can skip closed ones */}
                <MaterialDesignIcons
                    name="chevron-right"
                    size={40}
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: -445,
                        zIndex: 999,
                    }}
                    onPress={onNextRecommendation}
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
                    onPress={onPrevRecommendation}
                />
            </EmptyRecommendationContainer>
        );
    }


    return (
        <RecommendationContainer style={{zIndex: 999, height: 300}}>

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

                <RecommendationInfoContainer style={{zIndex: 999, marginTop: 35}}>
                <GymTitle>{selectedLocation.name}</GymTitle>

                <StatsContainer>
                    <TouchableOpacity
                        style={{zIndex: 999, position: "absolute"}}
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

                        {console.log(JSON.stringify(ratings))}
                    </TouchableOpacity>


                    <Text>{"\n"}</Text>
                    <StatsText>User Rating</StatsText>:{' '}
                    {selectedLocation.rating} ★ ({selectedLocation.totalRatings})
                    {'\n'}
                    <StatsText>Opened</StatsText>:{' '}
                    {selectedLocation.isOpenNow ? (
                        <OpenText>Open</OpenText>
                    ) : (
                        <CloseText>Closed</CloseText>
                    )}
                    {'\n'}
                    <StatsText>Address</StatsText>: {selectedLocation.address}
                    {'\n'}
                    <StatsText>Tel</StatsText>: {selectedLocation.phone}
                    {'\n'}
                    <StatsText>Distance: </StatsText>
                    {typeof distanceKm === "number" && (
                        <DistanceText>
                            {distanceKm.toFixed(1)} km away
                        </DistanceText>
                    )}

                </StatsContainer>
            </RecommendationInfoContainer>

            <ImageContainer style={{zIndex: 999, marginTop: 30}}>
                <Image
                    source={{uri: selectedLocation.photo}}
                    style={{width: "100%", height: 200, marginTop: 5, borderRadius: 20}}
                />
            </ImageContainer>
            <StarRatingModal
                visible={ratingModalVisible}
                initialValue={currentRating || 0}
                userId={userId}
                placeId={selectedLocation?.placeId}     // MUST be Google ID
                gymName={selectedLocation?.name}        // MUST be a string
                onSubmit={(value) => onSetRating(selectedLocation.placeId, value)}
                onClose={() => setRatingModalVisible(false)}
            />





        </RecommendationContainer>
    );
}

// --- styles unchanged ---
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
