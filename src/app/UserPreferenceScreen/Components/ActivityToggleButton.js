import styled from "styled-components/native";
import React from "react";
import {Switch, Text} from "react-native";
const highlight = "#6f4b63"
const light_purple = "#a8809b";
const Tile = styled.View`
    width: 32.5%;               /* ensures 3 per row */

    height: 80px;
    border-radius: 16px;
    border-width: 2px;
    border-color: ${light_purple};
    padding-left:5px;
    padding-right:10px;
    margin-bottom: 7px;

    justify-content: center;  /* vertically center content */
`;


const TileRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 105%;
`;


const TileLabel = styled.Text`
    font-size: 16px;
    font-weight: 700;
    color: ${highlight};
`;

export const ThemedSwitch = styled(Switch).attrs(({ value }) => ({
    trackColor: { false: "#d6bdd5", true: "#a8809b" },
    thumbColor: value ? highlight : "#f4f3f4",
    ios_backgroundColor: "#d6bdd5",
}))`
  transform: scaleX(1.1) scaleY(1.1);
  position: relative;
    right: 4;
`;


export default function ActivityToggleButton({ activityLabel, value, onChange }) {
    return (
        <Tile>
            <TileRow>
                <TileLabel  style={{
                    flexShrink: 1,
                    flexWrap: "wrap"
                }}>{activityLabel}</TileLabel>
                <ThemedSwitch value={value} onValueChange={onChange} />
            </TileRow>
        </Tile>
    );
}
