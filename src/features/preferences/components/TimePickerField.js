import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-paper';

export function TimePickerField() {
    const [time, setTime] = useState(new Date());
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        // On Android, user can cancel -> selectedDate will be undefined
        if (event.type === 'dismissed' || !selectedDate) {
            setShow(false);
            return;
        }

        setShow(false);
        setTime(selectedDate);
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
                editable={false}
                mode="outlined"
                onPressIn={() => setShow(true)}
                right={
                    <TextInput.Icon
                        icon="clock-outline"
                        onPress={() => setShow(true)}
                    />
                }
            />

            {show && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChange}
                />
            )}
        </View>
    );
}
