import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-paper';
import styled from "styled-components/native";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

export const TouchInput = styled.TouchableOpacity`
    border-width: 2px;             /* ← thick border */
    border-color: #a8809b;
    border-radius: 14px;
    padding: 14px 16px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
`;

export const TouchInputLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #82377b;
`;



export function TimePickerField({ value, onChange }) {
    const [time, setTime] = useState(value || new Date());
    const [show, setShow] = useState(false);

    // keep internal state in sync if parent updates `value`
    useEffect(() => {
        if (value) {
            setTime(value);
        }
    }, [value]);

    const handleChange = (event, selectedDate) => {
        // On Android, user can cancel -> selectedDate will be undefined
        if (event.type === 'dismissed' || !selectedDate) {
            setShow(false);
            return;
        }

        setShow(false);
        setTime(selectedDate);
        // call parent callback if provided
        if (onChange) {
            onChange(selectedDate);
        }
    };

    const formattedTime = time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <View onPress={() => setShow(true)}>
            <TouchInput onPress={() => setShow(true)}>
                <TouchInputLabel>{formattedTime}</TouchInputLabel>
                <MaterialIcons
                    name="clock-outline"
                    size={26}
                    color="#82377b"
                />
            </TouchInput>



            {show && (
                <DateTimePicker
                    style={{ backgroundColor: 'floralwhite' }}
                    value={time}                 // use internal state
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    textColor="#82377b"          // only affects iOS
                    positiveButton={{ label: 'OK', textColor: '#82377b' }}
                    neutralButton={{ label: 'Clear', textColor: '#82377b' }}
                    negativeButton={{ label: 'Cancel', textColor: '#82377b' }}
                    onChange={handleChange}
                />
            )}
        </View>
    );
}
