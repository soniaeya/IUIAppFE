import React from 'react';
import {SafeAreaView, View} from 'react-native';
import styled from 'styled-components/native';
import { gs } from '../../../ui/theme/GlobalStyles';

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
  margin-top: 140px;
`;

const SaveText = styled.Text`
  color: white;
  font-weight: 700;
  font-size: 16px;
`;




export default function PreferencesScreen() {
    const [activity, setActivity] = React.useState('');
    const [time, setTime] = React.useState('');
    const [favorite, setFavorite] = React.useState('');
    const [preferences, setPreferences] = React.useState(['']);


    return (
        <View style={gs.screen}>
            <Section>
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
                <OptionButton selected={favorite === 'reading'} onPress={() => setFavorite('reading')}>
                    <OptionText>Reading</OptionText>
                </OptionButton>
                <OptionButton selected={favorite === 'sports'} onPress={() => setFavorite('sports')}>
                    <OptionText>Sports</OptionText>
                </OptionButton>
            </Section>

            <Section><Save onPress={() => setPreferences([activity, time, favorite])}></Save></Section>
        </View>
    );
}
export const Save = () => (
    <SaveButton>
        <SaveText>Save</SaveText>
    </SaveButton>
);
