import React, {useState} from 'react';
import {Platform, SafeAreaView, View} from 'react-native';
import styled from 'styled-components/native';
import { gs } from '../../../ui/theme/GlobalStyles';
import { useNavigation } from '@react-navigation/native';
import { Searchbar, Text } from 'react-native-paper';

import TimePickerField from '../components/TimePickerField';

import SearchExample from '../components/SearchExample';

const Container = styled(SafeAreaView)`
    flex: 1;
    background-color: #dbbdab;
    padding: 20px;
`;

const Section = styled.View`
    margin-bottom: 25px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #82377b;
  margin-bottom: 10px;
`;

const OptionButton = styled.TouchableOpacity`
  background-color: ${(props) => (props.selected ? '#C8A2C8' : '#e9d8f2')};
  padding: 15px;
  border-radius: 12px;
  margin-vertical: 6px;
  align-items: center;
`;

const OptionText = styled.Text`
  color: #333;
  font-size: 16px;
`;


const SaveButton = styled.TouchableOpacity`
  background-color: #c8a2c8;
  padding-vertical: 14px;
  border-radius: 12px;
  align-items: center;
  margin-top: 20%;
`;

const SaveText = styled.Text`
  color: white;
  font-weight: 700;
  font-size: 16px;
`;



export default function PreferencesScreen() {
    const navigation = useNavigation();
    const [activity, setActivity] = React.useState('');
    const [time, setTime] = React.useState('');
    const [favorites, setFavorite] = React.useState('');
    const [preferences, setPreferences] = React.useState(['']);
    const [isSaving, setIsSaving] = useState(false);

    const BASE_URL =
        Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';



    const handleSave = async () => {
        try {
            setIsSaving(true);

            const body = {
                activity: activity,
                time: time,
                favorites: favorites,

            };

            const response = await fetch(`${BASE_URL}/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            console.log('Server response:', data);
            if (response.ok) {
                navigation.navigate('HomeScreen');
            } else {
                console.error('Server error:', data);
            }


        } catch (err) {
            console.error('Error saving preferences:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={gs.screen}>
            <Section>
                <Title>Search</Title>
                <Title>1. Choose Activity</Title>
                <OptionButton selected={activity === 'indoor'} onPress={() => setActivity('indoor')}>
                    <OptionText>Indoor</OptionText>
                </OptionButton>
                <OptionButton selected={activity === 'outdoor'} onPress={() => setActivity('outdoor')}>
                    <OptionText>Outdoor</OptionText>
                </OptionButton>
            </Section>

            <Section>
                <Title>2. Preferred Time</Title>
                <OptionButton selected={time === 'morning'} onPress={() => setTime('morning')}>
                    <OptionText>Morning</OptionText>
                </OptionButton>
                <OptionButton selected={time === 'evening'} onPress={() => setTime('evening')}>
                    <OptionText>Evening</OptionText>
                </OptionButton>

            </Section>

            <Section>
                <Title>3. Favorite Activity</Title>
                <OptionButton selected={favorites === 'reading'} onPress={() => setFavorite('reading')}>
                    <OptionText>Reading</OptionText>
                </OptionButton>
                <OptionButton selected={favorites === 'sports'} onPress={() => setFavorite('sports')}>
                    <OptionText>Sports</OptionText>
                </OptionButton>
                <SearchExample></SearchExample>
            </Section>

            <Section><Save onPress={handleSave}></Save></Section>
        </View>
    );
}
export const Save = ({onPress}) => (
    <SaveButton onPress={onPress}>
        <SaveText>Save</SaveText>
    </SaveButton>
);