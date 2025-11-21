import React, {useState} from 'react';
import {Platform, View} from 'react-native';
import styled from 'styled-components/native';
import {gs} from '../theme/GlobalStyles';
import {useNavigation} from '@react-navigation/native';
import {TimePickerField} from './Components/TimePickerField';
import axios from "axios";
import ActivityToggleButton from "./Components/ActivityToggleButton";
import { ScrollView } from "react-native";
import IndoorOutdoorDropdown from "./Components/IndoorOutdoorDropdown";
import IntensityDropdown from "./Components/IntensityDropdown";

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

const SubTitle = styled.Text`
    font-size: 18px;
    font-weight: 500;
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


const ACTIVITY_CONFIG = {
    boxing: {
        label: "Boxing🥊",
        type: "Boxing",
        env: "Indoor",
        active: false,      // ⭐ state of toggle
    },
    muaythai: {
        label: "Muay Thai 🇹🇭",
        type: "Muay Thai",
        env: "Indoor",
        active: false,
    },
    kb: {
        label: "Savate 🇫🇷",
        type: "Savate",
        env: "Indoor",
        active: false,
    },
    parks: {
        label: "Parks🌳️",
        type: "Parks",
        env: "Outdoor",
        active: false,
    },
    meditation: {
        label: "Relax 😌",
        type: "Relax",
        env: "Indoor",
        active: false,
    },
    eat: {
        label: "Eat 🍽️",
        type: "Eat",
        env: "Indoor",
        active: false,
    },
};


export default function UserPreferencesScreen() {
    const navigation = useNavigation();
    const [env, setEnv] = React.useState('');
    const [time, setTime] = React.useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [intensity, setIntensity] = useState(null);
    const [activityConfig, setActivityConfig] = useState(ACTIVITY_CONFIG);
    const getSelectedActivities = () =>
        Object.values(activityConfig)
            .filter(cfg => cfg.active)
            .map(cfg => cfg.type);

    const BASE_URL =
        Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const selectedActivities = getSelectedActivities();

            const payload = {
                activities: selectedActivities,   // all toggled types
                env,
                intensity,                // can be null if not chosen
                time: time.toISOString(), // send ISO string to FastAPI
            };

            console.log("Saving preferences payload:", payload);

            const response = await axios.post(`${BASE_URL}/api/preferences/`, payload);

            navigation.navigate('MapScreen');
        } catch (err) {
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
                    {Object.entries(activityConfig).map(([key, cfg]) => (
                        <ActivityToggleButton
                            key={key}
                            activityLabel={cfg.label}      // from config
                            value={cfg.active}             // on/off from config
                            onChange={(newVal) => {
                                // 1️⃣ Update active ON/OFF in config
                                setActivityConfig(prev => {
                                    const next = {
                                        ...prev,
                                        [key]: {
                                            ...prev[key],
                                            active: newVal,
                                        },
                                    };

                                    // ⭐ key–value pair log, e.g. { Boxing: true }
                                    console.log({ [cfg.type]: newVal });

                                    return next;
                                });

                                // 2️⃣ Update preference states for backend
                                if (newVal) {
                                    setEnv(cfg.env);        // e.g., "Indoor" / "Outdoor"
                                }
                            }}
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
