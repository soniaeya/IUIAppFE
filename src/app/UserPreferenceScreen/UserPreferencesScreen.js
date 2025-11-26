import React, {useEffect, useState} from 'react';
import {Alert, AlertEnv, Platform, View} from 'react-native';
import styled from 'styled-components/native';
import {gs} from '../theme/GlobalStyles';
import {useNavigation} from '@react-navigation/native';
import {TimePickerField} from './Components/TimePickerField';
import axios from "axios";
import ActivityToggleButton from "./Components/ActivityToggleButton";
import { ScrollView } from "react-native";
import IndoorOutdoorDropdown from "./Components/IndoorOutdoorDropdown";
import IntensityDropdown from "./Components/IntensityDropdown";
import CustomAlert from "./Components/CustomAlert";
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


export default function UserPreferencesScreen({ route }) {
    const { userId, email } = route.params;


    const navigation = useNavigation();
    const [env, setEnv] = React.useState('');
    const [time, setTime] = React.useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [intensity, setIntensity] = useState(null);
    const [activityConfig, setActivityConfig] = useState(ACTIVITY_CONFIG);
    const [alertEnvVisible, setAlertEnvVisible] = useState(false);
    const [intensityAlertVisible, setIntensityAlertVisible] = useState(false); // intensity

    const [rainAlertVisible, setRainAlertVisible] = useState(false);
    const handleEnvChange = (newEnv) => {
        if (newEnv === "Outdoor" && isRaining) {
            setRainAlertVisible(true);
        }
        setEnv(newEnv);
    };


    const isRaining = true; // set to true if raining, or pass weather info via navigation/context


    const getSelectedActivities = () =>
        Object.values(activityConfig)
            .filter(cfg => cfg.active)
            .map(cfg => cfg.type);

    const BASE_URL =
        Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';


    const applyBackendPreferences = (prefs) => {
        if (!prefs) return;

        // env / intensity / time from backend
        if (prefs.env) setEnv(prefs.env);
        if (prefs.intensity) setIntensity(prefs.intensity);
        if (prefs.time) {
            try {
                setTime(new Date(prefs.time));
            } catch (e) {
                console.log("Invalid time from backend:", prefs.time);
            }
        }

        // activities → toggle the right buttons
        if (Array.isArray(prefs.activities)) {
            setActivityConfig(prev => {
                const next = { ...prev };

                Object.keys(next).forEach(key => {
                    const type = next[key].type; // e.g. "Boxing", "Muay Thai"
                    next[key] = {
                        ...next[key],
                        active: prefs.activities.includes(type),
                    };
                });

                return next;
            });
        }
    };
    useEffect(() => {
        if (!userId) return;

        const fetchExistingPreferences = async () => {
            try {
                // 🔁 adjust endpoint/shape to match your backend
                const res = await axios.get(`${BASE_URL}/api/preferences/`, {
                    params: { user_id: userId },
                });

                // Possible shapes:
                // 1) { activities, env, intensity, time }
                // 2) { preferences: { activities, env, intensity, time } }
                const prefs =
                    res.data?.preferences && typeof res.data.preferences === "object"
                        ? res.data.preferences
                        : res.data;

                console.log("Loaded backend preferences:", prefs);
                applyBackendPreferences(prefs);
            } catch (err) {
                console.log(
                    "No existing preferences or failed to load:",
                    err.response?.data || err.message
                );
                // it's okay if there are none — user is probably new
            }
        };

        fetchExistingPreferences();
    }, [userId, BASE_URL]);
    const handleSave = async () => {
        try {
            // ✅ validate *before* setting isSaving so you don't get stuck in "saving"
            if (!env) {
                setAlertEnvVisible(true);
                return;
            }

            if (!intensity) {
                setIntensityAlertVisible(true);
                return;
            }

            setIsSaving(true);

            const selectedActivities = getSelectedActivities();

            const payload = {
                user_id: userId,              // ⭐ link prefs to this user
                activities: selectedActivities,
                env,
                intensity,
                time: time.toISOString(),     // preferred time
            };

            console.log("Saving preferences payload:", payload);

            // 1) Save full preferences (activities, env, intensity, time)
            await axios.post(`${BASE_URL}/api/preferences/`, payload);

            // 2) Explicitly update the user's preferred time via /user/time
            await axios.put(`${BASE_URL}/user/time`, {
                user_id: userId,
                time: time.toISOString(),     // FastAPI -> datetime
            });

            // 3) Navigate back to map with a "preferencesSet" flag
            navigation.navigate("MapScreen", {
                userId,
                preferencesSet: true,
            });
        } catch (err) {
            if (err.response) {
                console.error("Server error:", err.response.data);
                Alert.alert("Failed", JSON.stringify(err.response.data));
            } else {
                console.error("Network error:", err);
                Alert.alert("Error", "Network failure");
            }
        } finally {
            setIsSaving(false);
        }
    };




    return (
        <View style={gs.screen}>
            <CustomAlert
                visible={alertEnvVisible}
                title="Missing Information"
                message="Please select an environment (Indoor or Outdoor)"
                onClose={() => setAlertEnvVisible(false)}
            />
            <CustomAlert
                visible={intensityAlertVisible}
                title="Missing Information"
                message="Please select an intensity level"
                onClose={() => setIntensityAlertVisible(false)}
            />

            {/* 🌧️ Rain + Outdoor warning */}
            <CustomAlert
                visible={rainAlertVisible}
                title="Weather Warning"
                message="It is currently raining. We recommend choosing Indoor activities instead of Outdoor."
                onClose={() => setRainAlertVisible(false)}
            />

            <CustomAlert
                visible={alertEnvVisible}
                title="Missing Information"
                message="Please select an environment (Indoor or Outdoor)"
                onClose={() => setAlertEnvVisible(false)}
            />
            <CustomAlert
                visible={intensityAlertVisible}
                title="Missing Information"
                message="Please select an intensity level"
                onClose={() => setIntensityAlertVisible(false)}
            />
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
                                setActivityConfig(prev => {
                                    const next = {
                                        ...prev,
                                        [key]: {
                                            ...prev[key],
                                            active: newVal,
                                        },
                                    };

                                    console.log({ [cfg.type]: newVal });
                                    return next;
                                });

                                if (newVal) {

                                    setEnv(cfg.env);
                                }
                            }}

                        />
                    ))}
                </GridContainer>


            </ItemPreferenceDiv>
            <ItemPreferenceDiv>
                <ItemPreferenceLine></ItemPreferenceLine>
                <Title>Environment</Title>
                <IndoorOutdoorDropdown value={env} onChange={handleEnvChange} />


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
