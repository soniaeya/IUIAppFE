
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {View, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from "axios";
import RecommendationBox from "./RecommendationBox";
import {LoadingRecommendation} from "./LoadingRecommendation";
import {gs} from "../../theme/GlobalStyles";


export default function MapComponent({ userId  }) {
    const BASE_URL =
        Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
    const hasFetchedOnce = useRef(false);
    const [recUiVersion, setRecUiVersion] = useState(0);  // controls rec UI reset
    const lastPrefsTimeRef = useRef(null);
    const [recExpanded, setRecExpanded] = useState(false);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const searchRef = useRef(null);
    const [mapSearchQuery, setMapSearchQuery] = useState("");
    const lastLocationSourceRef = useRef("backend");  // 🔁 "device" | "backend"
    const [preferredTime, setPreferredTime] = useState(null); // Date | null
    const lastServerTimeRef = useRef(null);                   // ⭐ track last /user/time value
    const [ratings, setRatings] = useState({});
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [timeUpdateModalVisible, setTimeUpdateModalVisible] = useState(false);

    const [recommendations, setRecommendations] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [recLoading, setRecLoading] = useState(true);
    const [currentGymIndex, setCurrentGymIndex] = useState(0);
    const [weather, setWeather] = useState(null);
    const [showWeatherModal, setShowWeatherModal] = useState(false);
    const [weatherInfo, setWeatherInfo] = useState(null);

    const [locationPopupVisible, setLocationPopupVisible] = useState(false);
// ⏰ time change modal state
    const [timeChangeModalVisible, setTimeChangeModalVisible] = useState(false);
    const [lastTimeString, setLastTimeString] = useState("");
    const [currentTimeString, setCurrentTimeString] = useState("");


    const [weatherLocked, setWeatherLocked] = useState(false);  // when true, API won't overwrite

    const buildPreferredTimeToday = () => {
        if (!preferredTime) return null;

        const now = new Date();
        const d = new Date(now);
        d.setHours(preferredTime.getHours(), preferredTime.getMinutes(), 0, 0);
        return d;
    };
// 🔁 Poll backend for preferred time (so Swagger changes are detected)
    useEffect(() => {
        if (!userId) return;

        const pollPreferredTime = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/preferences/`, {
                    params: { user_id: userId },
                });

                const prefs =
                    res.data?.preferences && typeof res.data.preferences === "object"
                        ? res.data.preferences
                        : res.data;

                const serverTimeStr = prefs?.time;
                if (!serverTimeStr) return;

                // First time: just initialize state + ref
                if (lastPrefsTimeRef.current === null) {
                    lastPrefsTimeRef.current = serverTimeStr;
                    if (!preferredTime) {
                        const firstDate = new Date(serverTimeStr);
                        setPreferredTime(firstDate);
                    }
                    return;
                }

                // If backend time changed (Swagger, another client, etc.)

            } catch (err) {
                console.log(
                    "Could not poll preferred time:",
                    err.response?.data || err.message
                );
            }
        };

        // run once immediately, then every 15s
        pollPreferredTime();
        const interval = setInterval(pollPreferredTime, 3000);

        return () => clearInterval(interval);
    }, [userId, BASE_URL, fetchRecommendations, preferredTime]);



    useEffect(() => {
        if (!preferredTime) return;

        console.log("⏰ Preferred time changed:", preferredTime.toISOString());

        // 1) Re-fetch recommendations (backend can eventually use this time)
        fetchRecommendations();

        // 2) Reset / refresh RecommendationBox UI
        setRecExpanded(true);         // or false if you prefer collapsed
        setRecUiVersion(v => v + 1);  // force re-mount
        setCurrentIdx(0);             // start from first recommendation

        // 3) Recompute openAtPreferredTime for the currently selected place
        setSelectedLocation(prev => {
            if (!prev) return prev;

            const prefDate = buildPreferredTimeToday();
            const updatedOpenAtPreferred = prefDate
                ? checkIfOpen(prev.rawPeriods, prefDate)
                : false;

            return {
                ...prev,
                openAtPreferredTime: updatedOpenAtPreferred,
            };
        });
    }, [preferredTime, fetchRecommendations]);

// ⏰ Format a Date into HH:MM (24h or 12h depending on device)
    const formatTime = (date) =>
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// ⏰ Detect device time jumps

    useEffect(() => {
        if (!userId) return;

        const loadInitialLocation = async () => {
            if (location) return;          // don't override device GPS
            await fetchBackendLocation(false);  // initial center, no popup
        };

        loadInitialLocation();
    }, [userId]);



    useEffect(() => {
        if (!userId) return;

        const interval = setInterval(() => {
            // 🔁 Check if backend location changed; show modal if yes
            fetchBackendLocation(true);
        }, 15000); // every 15s (tune this if you want)

        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        // 🔥 TEMP: manual weather override for testing
        setWeatherInfo({
            main: "Clear",          // "Clear", "Clouds", "Snow", "Rain"
            description: "test rain",
            temp: 12,
        });
    }, []);

    const fetchRecommendations = useCallback(async () => {
        if (!userId) return;

        setRecLoading(true);   // ⬅️ start loading

        try {
            const res = await axios.get(`${BASE_URL}/recommendations`, {
                params: { user_id: userId },
            });

            setRecommendations(res.data.recommendations || []);
        } catch (err) {
            if (err.response?.status === 400) {
                console.log("➡️ Preferences not set yet. Skipping recommendations.");
                setRecommendations([]);      // nothing to show
                setRecLoading(false);        // ⬅️ stop loading
                return;
            }
            console.error(
                "Error fetching recommendations",
                err.response?.data || err.message
            );
        } finally {
            setRecLoading(false);            // ⬅️ stop loading in normal case
        }
    }, [userId, BASE_URL]);



    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

// 🔁 Watch for backend /user/time changes (e.g. from Swagger)
    useEffect(() => {
        if (!userId) return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${BASE_URL}/user/time`, {
                    params: { user_id: userId },
                });

                const serverIso = res.data?.time;
                if (!serverIso) return;

                // First time: just initialize local state, don't pop modal
                if (!lastServerTimeRef.current) {
                    lastServerTimeRef.current = serverIso;
                    setPreferredTime(new Date(serverIso));
                    return;
                }

                // If server time changed (e.g. via Swagger PUT /user/time)
                if (lastServerTimeRef.current !== serverIso) {
                    console.log("⏰ Detected server /user/time change:", serverIso);
                    lastServerTimeRef.current = serverIso;

                    const newDate = new Date(serverIso);
                    setPreferredTime(newDate);              // updates your preferredTime state
                    setTimeUpdateModalVisible(true);        // ⭐ show modal

                    // 🔄 refresh recommendations & open the RecommendationBox
                    fetchRecommendations();
                    setRecExpanded(true);
                    setRecUiVersion(v => v + 1);
                    setCurrentIdx(0);
                }
            } catch (err) {
                console.log(
                    "Error polling /user/time:",
                    err.response?.data || err.message
                );
            }
        }, 10000); // every 10s (tune if you want)

        return () => clearInterval(interval);
    }, [userId, BASE_URL, fetchRecommendations]);

    useEffect(() => {
        // start with "now" as baseline
        let previous = new Date();
        setCurrentTimeString(formatTime(previous));

        const interval = setInterval(() => {
            const now = new Date();
            const diffMs = Math.abs(now.getTime() - previous.getTime());

            // We expect ~5000 ms between ticks.




            previous = now;
        }, 5000); // check every 5 seconds

        return () => clearInterval(interval);
    }, [fetchRecommendations]);


    const fetchBackendLocation = async (showPopupOnChange = false) => {
        if (!userId) return;

        try {
            const res = await axios.get(`${BASE_URL}/user/location`, {
                params: { user_id: userId },
            });

            console.log("GET /user/location response:", res.data);

            const { latitude, longitude } = res.data || {};
            if (latitude == null || longitude == null) {
                console.log("Backend has no location yet");
                return;
            }

            const coords = { latitude, longitude };

            // Use unified helper; don't PUT again (skipBackend: true)
            await updateUserLocation(coords, {
                skipBackend: true,
                showPopup: showPopupOnChange,   // show modal only when polling
                source: "backend",              // 🧠 mark source
            });
        } catch (err) {
            console.log(
                "Could not fetch backend location:",
                err.response?.data || err.message
            );
        }
    };









    const selectLocationByName = async (name) => {
        if (searchRef.current) {
            searchRef.current.setAddressText(name);
        }

        setMapSearchQuery(name);   // keep text input in sync
        await selectFirstPlaceForText(name);  // does the actual Google lookup + handlePlaceSelect




    };



    const getWeatherBarStyle = (main) => {
        // main = "Rain", "Clear", "Clouds", "Snow", etc.
        if (["Rain", "Drizzle", "Thunderstorm"].includes(main)) {
            return { backgroundColor: "#3b82f6" }; // blue
        }
        if (["Snow"].includes(main)) {
            return { backgroundColor: "#60a5fa" }; // lighter blue
        }
        if (["Clear"].includes(main)) {
            return { backgroundColor: "#22c55e" }; // green
        }
        if (["Clouds"].includes(main)) {
            return { backgroundColor: "#9ca3af" }; // gray
        }
        return { backgroundColor: "#6f4b63" }; // default purple
    };

    const renderWeatherMessage = (info) => {
        const main = info.main;
        const temp = info.temp;

        if (["Rain", "Drizzle", "Thunderstorm"].includes(main)) {
            return `🌧️ It's ${main.toLowerCase()} — better to choose Indoor activities today.`;
        }
        if (["Snow"].includes(main)) {
            return `❄️ Snowy weather — Indoor activities might be more comfortable.`;
        }
        if (["Clear"].includes(main)) {
            return `☀️ Clear skies — Outdoor or Indoor, your choice!`;
        }
        if (["Clouds"].includes(main)) {
            return `☁️ Cloudy — Both Indoor and Outdoor could work.`;
        }
        return `🌤️ Current weather: ${main || "Unknown"}`;
    };



    const updateUserLocation = async (
        coords,
        options = {}      // { skipBackend?: boolean, showPopup?: boolean, source?: "device" | "backend" }
    ) => {
        const {
            skipBackend = false,
            showPopup = false,
            source = "device",
        } = options;

        // remember where this location came from
        lastLocationSourceRef.current = source;

        // 1) Update local state & optionally show modal
        setLocation(prev => {
            const changed =
                !prev ||
                prev.latitude !== coords.latitude ||
                prev.longitude !== coords.longitude;

            if (changed && showPopup) {
                setLocationPopupVisible(true);
            }
            return coords;
        });

        // 2) Recenter map
        if (mapRef.current) {
            mapRef.current.animateToRegion(
                { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                1000
            );
        }

        // 3) Optionally push to backend
        if (skipBackend || !userId) return;

        try {
            const payload = {
                user_id: userId,
                location: {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                },
            };

            console.log("PUT /user/location payload:", payload);
            const res = await axios.put(`${BASE_URL}/user/location`, payload);
            console.log("User location updated in backend:", res.data);
        } catch (err) {
            console.log(
                "Error updating backend location:",
                err.response?.data || err.message
            );
        }
    };


    useEffect(() => {
        const interval = setInterval(() => {
            getCurrentLocation();   // check device location every 5 sec
        }, 5000);

        return () => clearInterval(interval);
    }, []);



    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const coords = { latitude, longitude };

                console.log("📍 Device GPS:", coords);

                // 🔐 If last update came from backend, don't override it
                if (lastLocationSourceRef.current === "backend") {
                    console.log("Skipping GPS update — backend location is active");
                    setLoading(false);
                    return;
                }

                const isFirstTime = !hasFetchedOnce.current;
                hasFetchedOnce.current = true;

                // From device → update local + backend.
                // Show modal only after the first reading.
                updateUserLocation(coords, {
                    showPopup: !isFirstTime,
                    source: "device",
                });

                setLoading(false);
            },
            (error) => {
                console.log("❌ Geolocation error:", error);
                setError(`Location error: ${error.message}`);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
                distanceFilter: 0,
                forceRequestLocation: true,
                showLocationDialog: true,
            }
        );
    };






    const selectFirstPlaceForText = async (text) => {
        try {

            const findResp = await axios.get(
                "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
                {
                    params: {
                        input: text,
                        inputtype: "textquery",
                        fields: "place_id,name,geometry,formatted_address,photos,opening_hours",
                        key: "AIzaSyDgne1zVrGt-GIf8s2ayoNs6kE3O4iVUXc",
                    },
                }
            );

            const candidates = findResp.data.candidates || [];
            console.log("candidates for", text, candidates);

            if (candidates.length === 0) {
                console.log("No candidates for text:", text);
                return;
            }

            const first = candidates[0];

            const detailsResp = await axios.get(
                "https://maps.googleapis.com/maps/api/place/details/json",
                {
                    params: {
                        place_id: first.place_id,
                        key: "AIzaSyDgne1zVrGt-GIf8s2ayoNs6kE3O4iVUXc",
                        fields:
                        // ⭐ add place_id here
                            "place_id,name,geometry,formatted_address,photos," +
                            "formatted_phone_number,website,rating,user_ratings_total," +
                            "opening_hours,address_components",
                    },
                }
            );

            const details = detailsResp.data.result;
            console.log("details.place_id from Next/Prev:", details.place_id); // debug

            if (!details) {
                console.log("No details for first candidate");
                return;
            }

            handlePlaceSelect({ description: text }, details);
            return details;
        } catch (err) {
            console.log("Error selecting first place:", err.message, err.response?.data);
        }
    };

    function checkIfOpen(periods, now) {
        if (!periods || !Array.isArray(periods)) return false;

        const day = now.getDay(); // 0=Sun...6=Sat
        const time = now.getHours() * 100 + now.getMinutes(); // HHMM

        for (const p of periods) {
            const open = p.open;
            const close = p.close;

            if (!open || open.day == null) continue;

            // match today
            if (open.day !== day) continue;

            const openTime = parseInt(open.time);   // "0930" → 930
            const closeTime = parseInt(close?.time || "2359");

            // normal same-day closing
            if (time >= openTime && time < closeTime) return true;

            // handle after-midnight closure
            if (close && close.day !== open.day) {
                // example: open 18:00, close next day 02:00
                if (time >= openTime || time < parseInt(close.time)) {
                    return true;
                }
            }
        }

        return false;
    }



    const goToIndex = async (idx) => {
        if (!recommendations.length) return;

        const boundedIdx = (idx + recommendations.length) % recommendations.length;
        const name = recommendations[boundedIdx];

        setCurrentIdx(boundedIdx);
        await selectFirstPlaceForText(name);  // this will update selectedLocation
    };

    const handleSetRating = (placeId, value) => {
        setRatings(prev => ({
            ...prev,
            [placeId]: value,
        }));
    };

    const skipClosed = async (startIdx, step) => {
        if (!recommendations.length) return;

        let tries = 0;
        let currentIndex = startIdx;

        const now = new Date();
        const prefDate = buildPreferredTimeToday(); // today at user’s preferred HH:MM

        while (tries < recommendations.length) {
            const name = recommendations[currentIndex];

            const details = await selectFirstPlaceForText(name);
            if (!details) {
                currentIndex = (currentIndex + step + recommendations.length) % recommendations.length;
                tries++;
                continue;
            }

            const periods = details.opening_hours?.periods || [];

            const isOpenNow = checkIfOpen(periods, now);
            let isOpenAtPreferred = false;
            if (prefDate) {
                isOpenAtPreferred = checkIfOpen(periods, prefDate);
            }

            // ✅ accept gyms that are either open now OR will be open at preferred time
            if (isOpenNow || isOpenAtPreferred) {
                setCurrentIdx(currentIndex);
                return;
            }

            currentIndex = (currentIndex + step + recommendations.length) % recommendations.length;
            tries++;
        }
    };



    const handleNextRecommendation = async () => {
        await skipClosed(currentIdx + 1, +1);   // move forward
    };

    const handlePrevRecommendation = async () => {
        await skipClosed(currentIdx - 1, -1);   // move backward
    };


    useEffect(() => {
        if (!userId) return;

        const fetchRatings = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/ratings/`, {
                    params: { user_id: userId },
                });

                // backend returns { ratings: { placeId: value, ... } }
                setRatings(res.data?.ratings || {});
                console.log("Loaded ratings from backend:", res.data?.ratings);
            } catch (err) {
                console.log(
                    "Error loading ratings:",
                    err.response?.data || err.message
                );
            }
        };

        fetchRatings();
    }, [userId, BASE_URL]);


    useEffect(() => {
            const requestLocationPermission = async () => {
                if (Platform.OS === 'android') {
                    try {
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                            {
                                title: 'Location Permission',
                                message: 'This app needs access to your location',
                                buttonPositive: 'OK',
                            }
                        );
                        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                            console.log('Location permission granted');
                            getCurrentLocation();
                        } else {
                            console.log('Location permission denied');
                            setError('Location permission denied');
                            setLoading(false);
                        }
                    } catch (err) {
                        console.warn(err);
                        setError('Permission error: ' + err.message);
                        setLoading(false);
                    }
                } else {
                    getCurrentLocation();
                }
            };




            requestLocationPermission();
        }, []);




   const getShortAddress = (details) => {
        const comps = details.address_components || [];

        const streetNumber = comps.find(c => c.types.includes('street_number'))?.long_name || '';
        const route        = comps.find(c => c.types.includes('route'))?.long_name || '';

        return `${streetNumber} ${route}`.trim().replace(/^, /, '');
    };
    const handlePlaceSelect = (data, details) => {

        const placeId = details.place_id;
        const shortAddress = getShortAddress(details);

        let photoUrl = null;
        if (details.photos && details.photos.length > 0) {
            const photoRef = details.photos[0].photo_reference;
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=AIzaSyDgne1zVrGt-GIf8s2ayoNs6kE3O4iVUXc`;
        }
        const periods = details.opening_hours?.periods || [];
        const deviceDate = new Date();  // actual device time

// compute if open using device time
        const recomputedOpen = checkIfOpen(periods, deviceDate);
        let openAtPreferredTime = false;
        const prefDate = buildPreferredTimeToday();
        if (prefDate) {
            openAtPreferredTime = checkIfOpen(periods, prefDate);
        }

        // Postal code (H2X 1K4 → prefix H2X if you want)
        const postalComp = details.address_components?.find(comp =>
            comp.types.includes('postal_code')
        );
        const postalCode = postalComp?.long_name || '';

        // Is it open now?
/*        const isOpenNow = details.current_opening_hours?.open_now ?? false;*/

        // Today’s hours (from weekday_text)
        let todaysHours = '';
        if (details.current_opening_hours?.weekday_text) {
            const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ...
            // weekday_text starts Monday, so shift index:
            const index = (todayIndex + 6) % 7;     // Mon->0, Tue->1, ..., Sun->6
            todaysHours = details.current_opening_hours.weekday_text[index];
            // e.g. "Monday: 11:30 AM – 1:30 PM, 4:00 – 8:00 PM"
        }


        console.log("Selected place:", details);
        const { lat, lng } = details.geometry.location;
        const newLocation = {
            latitude: lat,
            longitude: lng,
        };
        setSelectedLocation({
            latitude: lat,
            longitude: lng,
            photo: photoUrl,
            name: details.name,
            address: shortAddress,
            phone: details.formatted_phone_number,
            website: details.website,
            rating: details.rating,
            totalRatings: details.user_ratings_total,
            isOpenNow: recomputedOpen,
            todaysHours,
            postalCode,
            placeId,
            rawPeriods: periods,
            openAtPreferredTime,        // ⭐ new field for the RecommendationBox UI
        });




        console.log("Selected location:", newLocation);


        if (mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                1000
            );
        }
    };
    const toRad = (deg) => (deg * Math.PI) / 180;

    const getDistanceKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };


    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const selectedDistanceKm =
        location && selectedLocation
            ? getDistanceKm(
                location.latitude,
                location.longitude,
                selectedLocation.latitude,
                selectedLocation.longitude
            )
            : null;


    return (
        <View style={[styles.container]}>
            <View style={[styles.searchContainer, {zIndex: 1999, top: 15, position: "absolute"}]}>
                {weatherInfo && (
                    <View
                        style={[
                            styles.weatherBar,
                            getWeatherBarStyle(weatherInfo.main),
                            {},
                        ]}
                    >
                        <Text style={styles.weatherBarText}>
                            {renderWeatherMessage(weatherInfo)}
                        </Text>
                    </View>
                )}

                <GooglePlacesAutocomplete
                    ref={searchRef}
                    placeholder="Search for a place..."
                    fetchDetails={true}
                    onPress={(data, details) => handlePlaceSelect(data, details)}

                    query={{
                        key: 'AIzaSyDgne1zVrGt-GIf8s2ayoNs6kE3O4iVUXc',
                        language: 'en',
                    }}
                    // --- IMPORTANT: explicitly set defaults the lib fails to set ---
                    predefinedPlaces={[]}                 // <--- fixes the .filter error
                    predefinedPlacesAlwaysVisible={false}
                    autoFillOnNotFound={false}
                    currentLocation={false}
                    currentLocationLabel="Current location"
                    nearbyPlacesAPI="GooglePlacesSearch"
                    GooglePlacesSearchQuery={{ rankby: 'distance' }}
                    GooglePlacesDetailsQuery={{}}
                    GoogleReverseGeocodingQuery={{}}
                    filterReverseGeocodingByTypes={[]}
                    keepResultsAfterBlur={false}
                    enablePoweredByContainer={true}
                    enableHighAccuracyLocation={true}
                    listUnderlayColor="#c8c7cc"
                    keyboardShouldPersistTaps="always"
                    minLength={1}
                    timeout={20000}
                    textInputHide={false}
                    numberOfLines={1}
                    suppressDefaultStyles={false}


                    textInputProps={{
                        value: mapSearchQuery,
                        onChangeText: setMapSearchQuery,

                    }}

                    onFail={(error) => {
                        console.log("GOOGLE PLACES ERROR:", error);
                    }}

                    onNotFound={() => console.log("NO RESULTS FOUND")}

                    styles={{
                        container: { flex: 0 },
                        textInput: {
                            height: 48,
                            fontSize: 16,
                            borderRadius: 16,
                            paddingBottom: 0

                        },
                        listView: {
                            backgroundColor: "white",
                            zIndex: 10,
                            elevation: 10,
                            borderRadius: 16,
                        }
                    }}
                />


            </View>

            {recLoading || recommendations.length === 0 ? (
                // 💫 show loading container when there is no recommendation box
                <LoadingRecommendation />
            ) : (
                <RecommendationBox
                    key={recUiVersion}
                    expanded={recExpanded}
                    userId={userId}
                    selectedLocation={selectedLocation}
                    onNextRecommendation={handleNextRecommendation}
                    onPrevRecommendation={handlePrevRecommendation}
                    ratings={ratings}
                    onSetRating={handleSetRating}
                    setExpanded={setRecExpanded}
                    distanceKm={selectedDistanceKm}
                />
            )}





            {location ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                    followsUserLocation={true}
                >


                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="Your Location"
                        description="You are here"
                        pinColor="blue"
                    />

                    {selectedLocation && (
                        <Marker
                            coordinate={{
                                latitude: selectedLocation.latitude,
                                longitude: selectedLocation.longitude
                            }}
                            title={selectedLocation.name || "Selected Location"}
                            description={selectedLocation.address || ""}
                            pinColor="red"
                        />
                    )}


                </MapView>
            ) : null}
            {timeUpdateModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Preferred Time Updated</Text>
                        <Text style={styles.modalText}>
                            Your preferred time has been updated on the server.
                            Recommendations will now use this new time.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setTimeUpdateModalVisible(false)}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}


            {showWeatherModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>🌧️ Rain Alert</Text>
                        <Text style={styles.modalText}>
                            It's currently raining in your area.
                            You may prefer **Indoor** activities today.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowWeatherModal(false)}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}


            {timeChangeModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Time Updated</Text>
                        <Text style={styles.modalText}>
                            Device time changed from {lastTimeString || "previous time"} to{" "}
                            {currentTimeString || "current time"}.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setTimeChangeModalVisible(false)}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {locationPopupVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Location Updated</Text>
                        <Text style={styles.modalText}>
                            Your current location has been updated from your device.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setLocationPopupVisible(false)}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}





const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    searchContainer: {
        position: 'absolute',
        top: 15,
        left: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,

    },
    map: {
        flex: 1
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        padding: 20,
    },
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0)",
        justifyContent: "center",
        alignItems: "center",

    },
    modalBox: {
        marginTop: -80,
        width: "80%",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        zIndex:999,
        borderColor: "grey",
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        marginBottom: 16,
    },
    modalButton: {
        alignSelf: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#6f4b63",
    },
});
