import React, {useState} from 'react';
import {Platform, SafeAreaView, View} from 'react-native';
import styled from 'styled-components/native';
import {gs} from '../../../../ui/theme/GlobalStyles';
import {useNavigation} from '@react-navigation/native';
import {Searchbar, Text} from 'react-native-paper';
import MapScreen from '../MapScreen/MapScreen';
import MapComponent from '../MapScreen/MapComponent';
import {TimePickerField} from './TimePickerField';
import loginScreen from "../LoginScreen";
import axios from "axios";
import ActivityToggleButton from "./ActivityToggleButton";
import { ScrollView } from "react-native";
import IndoorOutdoorDropdown from "./IndoorOutdoorDropdown";
import IntensityDropdown from "./IntensityDropdown";

const highlight = "#6f4b63"
const dark_background = "#b0928f"
const background_color= "white"
const light_purple = "#a8809b";


const ItemPreferenceDiv = styled.View`
    margin-top: 0px;
    margin-bottom: 25px;
`;

const ItemPreferenceLine = styled.View`
    height: 1px;
    margin-bottom: 25px;
    width: 100%;
    border-bottom-width: 1px;
    border-bottom-color: ${highlight};
`;


const MainTitleDiv = styled.View`
    padding: 30px;
`;

const Title = styled.Text`
    font-size: 20px;
    font-weight: 700;
    color: ${highlight};
    margin-bottom: 10px;
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

    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 5px;
    padding-right: 5px;


    border-radius: 20px;


`;

/* highlight dark purple #ad959b*/



export default function UserPreferencesScreen() {
    const navigation = useNavigation();
    const [activity, setActivity] = React.useState('');
    const [env, setEnv] = React.useState('');
    const [time, setTime] = React.useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [intensity, setIntensity] = useState(null);


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

            console.log("Saving preferences:", {activity, time, env});


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
        boxing: false,
        kb: false,
        tkd: false,
        bjj: false,
        karate: false,
        muaythai: false,
    });

    function formatActivityLabel(key) {
        let label;

        switch (key) {
            case "boxing":
                label = "Boxing🥊";
                break;

            case "muaythai":
                label = "Muay Thai 🇹🇭";
                break;

            case "tkd":
                label = "TKD 🇰🇷"
                break;
            case "bjj":
                label = key.toUpperCase() + "      🇧🇷";
                break;

            case "kb":
                label = "Savate 🇫🇷";
                break;

            case "karate":
                label = "Karate 🥋";
                break;


        }

        return label;
    }


    return (
        <View style={gs.screen}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
            <MainTitleDiv>
                <Title style={{ alignSelf: "center", fontSize: 25, fontWeight: "bold",  paddingVertical: 9,  marginBottom: 0, paddingHorizontal: 30}}>Preference Selection</Title>
            </MainTitleDiv>
                <ItemPreferenceLine style={{marginTop: -5}}></ItemPreferenceLine>
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
                <ItemPreferenceLine></ItemPreferenceLine>
                <Title>Environment</Title>
                <IndoorOutdoorDropdown value={env} onChange={setEnv} />

            </ItemPreferenceDiv>
                <ItemPreferenceLine></ItemPreferenceLine>
                <ItemPreferenceDiv>

                    <Title>Intensity</Title>
                    <IntensityDropdown value={intensity} onChange={setIntensity} />
                </ItemPreferenceDiv>
                <ItemPreferenceLine></ItemPreferenceLine>

                <ItemPreferenceDiv>
                <Title>Preferred Time</Title>
                <TimePickerField value={time} onChange={setTime}></TimePickerField>

            </ItemPreferenceDiv>

                <ItemPreferenceLine></ItemPreferenceLine>
            <ItemPreferenceDiv>

                <SaveButton onPress={handleSave}>
                    <SaveText>Save</SaveText>
                </SaveButton>

            </ItemPreferenceDiv>
            </ScrollView>
        </View>
    );
}
