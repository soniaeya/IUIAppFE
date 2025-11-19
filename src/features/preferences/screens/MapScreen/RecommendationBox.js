/*This is the recommendation box

list: gym_recommendations_to_user
current_gym_idx: 0



- Have a list of the user's recommendations
- When the chevron button is pressed
- The next recommendation is displayed
- Inputs the Gym Name in the map search bar
- Changes the layout of the recommendation box

Needs to iterate through the user's recommendations
* */

import styled from "styled-components/native";
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {Image} from "react-native";
import React from "react";

const background_color = "#dbbdab";
const highlight = "#6f4b63"
export default function RecommendationBox({selectedLocation}) {
    return <RecommendationContainer>
        <MaterialDesignIcons

            name="chevron-right"
            size={40}
            style={{
                position: 'absolute',
                right: 0,
                bottom: -75,
                zIndex: 999,
            }}
            onPress={{}}


        />
        <MaterialDesignIcons

            name="chevron-left"
            size={40}
            style={{
                position: 'absolute',
                left: 0,
                bottom: -75,
                zIndex: 999,
            }}
            onPress={{}}

        />
        <RecommendationInfoContainer>
            <GymTitle>
                {selectedLocation.name}
            </GymTitle>
            <StatsContainer>
                <StatsText>Your Rating</StatsText>:{'\n'}
                <StatsText>User Rating</StatsText>: {selectedLocation.rating} ★ ({selectedLocation.totalRatings}){'\n'}
                <StatsText>Opened</StatsText>: {selectedLocation.isOpenNow
                ? <OpenText>Open</OpenText>
                : <CloseText>Closed</CloseText>
            }
                {'\n'}
                <StatsText>Address</StatsText>: {selectedLocation.address}
                {'\n'}
                <StatsText>Tel</StatsText>: {selectedLocation.phone}

            </StatsContainer>


        </RecommendationInfoContainer>
        <ImageContainer>
            <Image
                source={{ uri: selectedLocation.photo }}
                style={{ width: '100%', height: 200, marginTop: 5, borderRadius: 20 }}
            />
        </ImageContainer>

    </RecommendationContainer>
}



const RecommendationContainer = styled.View`

    top: 70px;
    border-radius: 16px;
    height: 300px;
    width: 100%;
    background-color: ${
    highlight
};
`;


const RecommendationInfoContainer = styled.View`
    border-radius: 16px;
    
    margin: 10px;
    z-index: 0;
    height: 200px;
    width: 40%;
    background-color: floralwhite;
`;

const GymTitle = styled.Text`
    font-family: 'Roboto-Bold';
    font-weight: bold;

    font-size: 15px;
    padding: 10px;
    padding-bottom: 0px;
    line-height: 18px;

`;

const OpenText = styled.Text`
    font-family: 'Roboto-Regular';
    font-size: 12px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
    color: darkolivegreen;
`;

const CloseText = styled.Text`
    font-family: 'Roboto-Regular';
    font-size: 12px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
    color: darkred;
`;
const StatsText = styled.Text`
    font-family: 'Roboto-Regular';
    font-size: 13px;
    font-weight: bold;
`;

const ImageContainer = styled.View`

    padding: 10px;
    position: absolute;
    left: 45%;

    height: 300px;
    width: 55%;
    background-color: ${
    background_color
};
`;

const StatsContainer = styled.Text`
    font-family: 'Roboto-Regular';
    font-size: 13px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
`;
