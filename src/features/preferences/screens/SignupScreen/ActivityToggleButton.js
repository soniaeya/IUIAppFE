import styled from "styled-components/native";
import React from "react";
import {Switch, Text} from "react-native";


const Tile = styled.View`
    width: 32%;               /* ensures 3 per row */
    aspect-ratio: 1;          /* makes them perfect squares */

    height: 10px;
    background-color: #f6e4d3;
    border-radius: 18px;
    border-width: 1.5px;
    border-color: #a8809b;

    padding:8px;
    margin-bottom: 12px;

    justify-content: center;  /* vertically center content */
`;


const TileRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 107%;
`;


const TileLabel = styled.Text`
    font-size: 16px;
    font-weight: 700;
    color: #000;
`;

export const ThemedSwitch = styled(Switch).attrs(({ value }) => ({
    trackColor: { false: "#d6bdd5", true: "#a8809b" },
    thumbColor: value ? "#82377b" : "#f4f3f4",
    ios_backgroundColor: "#d6bdd5",
}))`
  transform: scaleX(1.1) scaleY(1.1);
  position: relative;
    right: -9;
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
