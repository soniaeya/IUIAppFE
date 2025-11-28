import React, { useEffect, useState, useCallback } from 'react';
import {Alert, Platform, View} from 'react-native';
import styled from 'styled-components/native';
import { gs } from '../theme/GlobalStyles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
  const [intensityAlertVisible, setIntensityAlertVisible] = useState(false);
  const [rainAlertVisible, setRainAlertVisible] = useState(false);

  const BASE_URL =
    Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

  const [isRaining, setIsRaining] = useState(false);



  const applyBackendPreferences = useCallback((prefs) => {
    if (!prefs) {
      console.log("No preferences found in backend; resetting to defaults");
      setEnv('');
      setIntensity(null);
      setTime(new Date());
      setActivityConfig(ACTIVITY_CONFIG);
      return;
    }

    console.log("Applying preferences:", prefs);

    if (prefs.env) {
      console.log("Setting env to:", prefs.env);
      setEnv(prefs.env);
    }

    if (prefs.intensity) {
      console.log("Setting intensity to:", prefs.intensity);
      setIntensity(prefs.intensity);
    }

    if (prefs.time) {
      try {
        const parsedTime = new Date(prefs.time);
        console.log("Setting time to:", parsedTime);
        setTime(parsedTime);
      } catch (e) {
        console.log("Invalid time from backend:", prefs.time);
      }
    }

    if (Array.isArray(prefs.activities)) {
      console.log("Setting activities to:", prefs.activities);
      setActivityConfig(prev => {
        const next = { ...prev };

        Object.keys(next).forEach(key => {
          const type = next[key].type;
          const isActive = prefs.activities.includes(type);
          next[key] = {
            ...next[key],
            active: isActive,
          };
        });

        console.log("New activity config:", next);
        return next;
      });
    }
  }, []);

  const fetchPrefs = useCallback(async () => {
    console.log("🔍 fetchPrefs STARTED");
    console.log("userId:", userId);
    console.log("BASE_URL:", BASE_URL);

    try {
      console.log("Fetching preferences for user:", userId);

      const res = await axios.get(`${BASE_URL}/api/preferences/`, {
        params: { user_id: userId },
      });

      console.log("✅ Response received:", res.data);

      const prefs = res.data?.preferences ?? null;

      console.log("Loaded backend preferences:", prefs);
      applyBackendPreferences(prefs);
    }
    catch (err) {
      console.log(
        "❌ No existing preferences or failed to load:",
        err.response?.data || err.message
      );
      // optional: reset state if you want no backend prefs to clear UI
      applyBackendPreferences(null);
    }
  }, [userId, BASE_URL, applyBackendPreferences]);





  const fetchWeather = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/weather`, {
        params: { user_id: userId },
      });

      const data = res.data;
      const BAD_FOR_OUTDOOR = "Rain";
      const raining = BAD_FOR_OUTDOOR === data.main;
      console.log("Backend weather:", data.main, "→ isRaining =", raining);

      setIsRaining(raining);
    }
    catch (err) {
      console.log("Failed to fetch weather:", err.response?.data || err.message);
    }
  }, [userId, BASE_URL]);

  // ✅ Use a separate useEffect to handle the rain alert when env or isRaining changes
  useEffect(() => {
    if (isRaining && env === "Outdoor") {
      setRainAlertVisible(true);
    } else {
      setRainAlertVisible(false);
    }
  }, [isRaining, env]);




  useFocusEffect(
    useCallback(() => {
      console.log("===== UserPreferencesScreen FOCUSED, userId =", userId, "=====");

      fetchPrefs();
      fetchWeather();              // load weather from backend


      return () => {
        console.log("===== UserPreferencesScreen UNFOCUSED =====");
      };
    }, [fetchPrefs, fetchWeather, userId])
  );


  const handleEnvChange = (newEnv) => {
    setEnv(newEnv);  // Just update env, the useEffect above will handle the alert
  };

  const getSelectedActivities = () =>
    Object.values(activityConfig)
      .filter(cfg => cfg.active)
      .map(cfg => cfg.type);

  // ✅ Wrap in useCallback with proper dependencies



  const handleSave = async () => {
    if (!env) {
      setAlertEnvVisible(true);
      return;
    }

    if (!intensity) {
      setIntensityAlertVisible(true);
      return;
    }

    const selectedActivities = getSelectedActivities();

    console.log("📝 Selected activities before save:", selectedActivities);
    console.log("📝 Current activityConfig state:", activityConfig);

    const payload = {
      user_id: userId,
      activities: selectedActivities,
      env,
      intensity,
      time: time.toISOString(),
    };

    try {
      setIsSaving(true);
      console.log("💾 Saving preferences payload:", payload);

      const response = await axios.put(`${BASE_URL}/user/preferences`, payload);

      console.log("✅ Save response:", response.data);
      console.log("✅ Successfully saved with activities:", selectedActivities);

      navigation.navigate("MapScreen", {
        userId,
        preferencesSet: true,
      });
    }
    catch (err) {
      if (err.response) {
        console.error("❌ Server error:", err.response.data);
        Alert.alert("Failed", JSON.stringify(err.response.data));
      } else {
        console.error("❌ Network error:", err);
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
                visible={rainAlertVisible}
                title="Weather Warning"
                message="It is currently raining. We recommend choosing Indoor activities instead of Outdoor."
                onClose={() => setRainAlertVisible(false)}
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
                      activityLabel={cfg.label}
                      value={cfg.active}
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
                      }}
                    />
                  ))}
                </GridContainer>



            </ItemPreferenceDiv>
            <ItemPreferenceDiv>
                <ItemPreferenceLine />
                <Title>Environment</Title>
                <IndoorOutdoorDropdown value={env} onChange={handleEnvChange} />


            </ItemPreferenceDiv>
                <ItemPreferenceLine />
                <ItemPreferenceDiv>

                    <Title>Intensity</Title>
                    <IntensityDropdown value={intensity} onChange={setIntensity} />
                </ItemPreferenceDiv>
                <ItemPreferenceLine />

                <ItemPreferenceDiv>
                <Title>Preferred Time</Title>
                    <TimePickerField value={time} onChange={setTime} />

            </ItemPreferenceDiv>

                <ItemPreferenceLine />
            <ItemPreferenceDiv>

                <SaveButton onPress={handleSave}>
                    <SaveText>Save</SaveText>
                </SaveButton>

            </ItemPreferenceDiv>
            </ScrollView>
        </View>
    );
}
