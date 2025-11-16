import React, {useState} from 'react';
import {Platform, SafeAreaView, View} from 'react-native';
import styled from 'styled-components/native';
import { gs } from '../../../../ui/theme/GlobalStyles';
import { useNavigation } from '@react-navigation/native';
import { Searchbar, Text } from 'react-native-paper';
import MapScreen from '../MapScreen/MapScreen';
import MapComponent from '../MapScreen/MapComponent';
import {TimePickerField} from './TimePickerField';
import loginScreen from "../LoginScreen";
import ActivitySearchBar from './ActivitySearchBar';
import axios from "axios";

const Container = styled(SafeAreaView)`
    flex: 1;
    background-color: #dbbdab;
    padding: 20px;
`;

const ItemPreferenceDiv = styled.View`
    margin-bottom: 25px;
`;


const MainTitleDiv = styled.View`
    padding: 30px;
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
    const [env, setEnv] = React.useState('');
    const [time, setTime] = React.useState(new Date());
    const [isSaving, setIsSaving] = useState(false);

    const BASE_URL =
        Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const response = await axios.post(`${BASE_URL}/api/preferences/`, {
                activity,
                time,
                env
            });

            if (!response.ok) {
                // backend returned 4xx/5xx
                const errorText = await response.text();
                console.log('Save failed:', errorText);
                // Show a toast/snackbar here instead of alert if you prefer
                alert('Failed to save preferences');
                return;
            }

            const data = await response.json();
            console.log('Preferences saved:', data);

            navigation.navigate('MapScreen');

        } catch (err) {
            console.error('Error saving preferences:', err);
            alert('An error occurred while saving preferences');
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <View style={gs.screen}>
            <MainTitleDiv>
                <Title style={{alignSelf: "center", fontSize: 25}}>Preference Selection</Title>
            </MainTitleDiv>
            <ItemPreferenceDiv>
                <Title>Activity</Title>
                <ActivitySearchBar value={activity} onChange={setActivity} ></ActivitySearchBar>
            </ItemPreferenceDiv>
            <ItemPreferenceDiv>

                <Title>Environment</Title>
                <OptionButton  selected={env === 'indoor'} onPress={() => setEnv('indoor')}>
                    <OptionText style={{color: '#FFFFFF'}}>Indoor</OptionText>
                </OptionButton>
                <OptionButton selected={env === 'outdoor'} onPress={() => setEnv('outdoor')}>
                    <OptionText style={{color: '#FFFFFF'}}>Outdoor</OptionText>
                </OptionButton>
            </ItemPreferenceDiv>
            <ItemPreferenceDiv>
                <Title>Preferred Time</Title>
                <TimePickerField value={time} onChange={setTime} ></TimePickerField>

            </ItemPreferenceDiv>


            <ItemPreferenceDiv>

                <SaveButton onPress={handleSave}>
                    <SaveText>Save</SaveText>
                </SaveButton>

              </ItemPreferenceDiv>
        </View>
    );
}
