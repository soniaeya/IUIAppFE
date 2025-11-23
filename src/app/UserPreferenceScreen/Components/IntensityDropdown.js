import React, { useState } from "react";
import styled from "styled-components/native";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

const highlight = "#6f4b63"

const Wrapper = styled.View`
  margin-vertical: 12px;
`;

const Label = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${highlight};
  margin-bottom: 6px;
`;

const Selector = styled.TouchableOpacity`
  border-width: 2px;
  border-color: #a8809b;
  border-radius: 14px;
    padding: 14px 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SelectorText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${highlight};
`;

const DropdownBox = styled.View`
  margin-top: 6px;
  border-radius: 14px;
  border-width: 1.5px;
  border-color: #a8809b;
  overflow: hidden;
`;

const Option = styled.TouchableOpacity`
  padding-vertical: 12px;
  padding-horizontal: 16px;
`;

const OptionText = styled.Text`
  font-size: 16px;
  color: ${highlight};
  font-weight: 600;
`;

export default function IntensityDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);

    const options = [
        "Beginner",
        "Intermediate",
        "Advanced",
    ];

    const handleSelect = (val) => {
        onChange(val);
        setOpen(false);
    };

    return (
        <Wrapper>
            <Selector onPress={() => setOpen(!open)}

            >
                <SelectorText>
                    {value ? value : "Select Intensity"}
                </SelectorText>
                <MaterialIcons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={28}
                    color="#82377b"
                />
            </Selector>

            {open && (
                <DropdownBox>
                    {options.map((opt, index) => (
                        <Option
                            key={opt}
                            onPress={() => handleSelect(opt)}
                            style={{
                                borderBottomWidth: index !== options.length - 1 ? 1.5 : 0,
                                borderBottomColor: "#d9c1b8", // soft pastel divider
                            }}
                        >
                            <OptionText>{opt}</OptionText>
                        </Option>
                    ))}

                </DropdownBox>
            )}
        </Wrapper>
    );
}
