import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-paper';

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
        <View style={{ marginTop: 8 }}>
            <TextInput
                label="Choose time"
                value={formattedTime}
                editable={false}               // don't open keyboard
                mode="outlined"
                onPressIn={() => setShow(true)}
                activeOutlineColor="purple"
                right={
                    <TextInput.Icon
                        icon="clock-outline"
                        onPress={() => setShow(true)}
                    />
                }
            />

            {show && (
                <DateTimePicker
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
