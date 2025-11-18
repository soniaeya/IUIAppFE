import React, {useState} from 'react';
import {Platform, SafeAreaView, View} from 'react-native';
import styled from 'styled-components/native';
import {gs} from '../../../../ui/theme/GlobalStyles';
import {useNavigation} from '@react-navigation/native';
import {Searchbar, Text} from 'react-native-paper';
import MapScreen from '../MapScreen/MapScreen';
import MapComponent from '../MapScreen/MapComponent';
import {TimePickerField} from '../PreferenceScreen/TimePickerField';
import loginScreen from "../LoginScreen";
import ActivitySearchBar from '../PreferenceScreen/ActivitySearchBar';
import axios from "axios";
import ActivityToggleButton from "./ActivityToggleButton";
import { ScrollView } from "react-native";

const highlight = "#a8809b"

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
    background-color: ${(props) => (props.selected ? highlight : '#e9d8f2')};
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
    background-color: ${highlight};
    padding-vertical: 14px;
    border-radius: 12px;
    align-items: center;
    margin-top: 10%;
`;

const SaveText = styled.Text`
    color: white;
    font-weight: 700;
    font-size: 16px;
`;

const GridContainer = styled.View`
    flex-direction: row;
    flex-wrap: wrap;

    justify-content: space-between;
    align-items: center;

    padding: 16px;
    margin-top: 10px;

    border-width: 2px;
    border-color: #a8809b;
    border-radius: 20px;

    background-color: #eacbb3;

`;




export default function UserPreferencesScreen() {
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


            navigation.navigate('MapScreen');


        } catch (err) {
            // Axios error format
            if (err.response) {
                console.error("Server error:", err.response.data);
                alert(`Failed: ${JSON.stringify(err.response.data)}`);
            } else {
                console.error("Network / other error:", err);
                alert("Network error while saving preferences");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const [activities, setActivities] = useState({
        mma: false,
        tkd: false,
        bjj: false,
        kb: false,
        judo: false,
        aikido: false,
        muaythai: false,
        taichi: false,
        karate: false
    });

    function formatActivityLabel(key) {
        let label;

        switch (key) {
            case "muaythai":
                label = "Muay Thai";
                break;

            case "taichi":
                label = "Tai Chi";
                break;

            case "mma":
            case "bjj":
            case "tkd":
            case "kb":
                label = key.toUpperCase();
                break;

            default:
                label = key.charAt(0).toUpperCase() + key.slice(1);
                break;
        }

        // Always 9 characters (add spaces if shorter)
        return label;
    }


    return (
        <View style={gs.screen}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
            <MainTitleDiv>
                <Title style={{alignSelf: "center", fontSize: 25}}>Preference Selection</Title>
            </MainTitleDiv>
            <ItemPreferenceDiv>
                <Title>Activity</Title>

                <GridContainer>
                    {Object.entries(activities).map(([key, value]) => (
                        <ActivityToggleButton
                            key={key}
                            activityLabel={formatActivityLabel(key)}
                            value={value}
                            onChange={(newVal) =>
                                setActivities({...activities, [key]: newVal})
                            }
                        />
                    ))}
                </GridContainer>
            </ItemPreferenceDiv>
            <ItemPreferenceDiv>

                <Title>Environment</Title>
                <OptionButton selected={env === 'indoor'} onPress={() => setEnv('indoor')}>
                    <OptionText style={{color: '#FFFFFF'}}>Indoor</OptionText>
                </OptionButton>
                <OptionButton selected={env === 'outdoor'} onPress={() => setEnv('outdoor')}>
                    <OptionText style={{color: '#FFFFFF'}}>Outdoor</OptionText>
                </OptionButton>
            </ItemPreferenceDiv>
            <ItemPreferenceDiv>
                <Title>Preferred Time</Title>
                <TimePickerField value={time} onChange={setTime}></TimePickerField>

            </ItemPreferenceDiv>


            <ItemPreferenceDiv>

                <SaveButton onPress={handleSave}>
                    <SaveText>Save</SaveText>
                </SaveButton>

            </ItemPreferenceDiv>
            </ScrollView>
        </View>
    );
}
