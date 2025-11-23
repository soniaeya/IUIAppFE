import styled from "styled-components/native";
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {Image, Text, TouchableOpacity} from "react-native";
import React, {useEffect, useState} from "react";
import {Picker} from '@react-native-picker/picker';
import StarRatingDropdown from "./StarRatingModal";
import RatingDropdown from "./StarRatingModal";

const background_color = "white";
const highlight = "#6f4b63";
import StarRatingModal from "./StarRatingModal";
import {getCurrentPosition} from "@react-native-community/geolocation/js/implementation";


export default function RecommendationBox({
                                              selectedLocation,
                                              onNextRecommendation,
                                              onPrevRecommendation,
                                              ratings,
                                              onSetRating,
                                          })

{
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
                onPress={onNextRecommendation}
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
                onPress={onPrevRecommendation}
            />

        </EmptyRecommendationContainer>)
    }
    const userRatingForThisPlace = ratings[selectedLocation.placeId];
    const currentRating = ratings[selectedLocation?.placeId] || 0;




    return (
        <RecommendationContainer>
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

            <RecommendationInfoContainer>
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
                </StatsContainer>
            </RecommendationInfoContainer>

            <ImageContainer>
                <Image
                    source={{uri: selectedLocation.photo}}
                    style={{width: "100%", height: 200, marginTop: 5, borderRadius: 20}}
                />
            </ImageContainer>
            <StarRatingModal
                visible={ratingModalVisible}
                initialValue={currentRating || 0}
                onSubmit={async (value) => {
                    const id = selectedLocation?.placeId;
                    if (!id) {
                        console.warn("No placeId for selected location, skipping rating save.");
                        return;
                    }
                    onSetRating(id, value);  // ✅ correct
                }}
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
    height: 300px;
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
