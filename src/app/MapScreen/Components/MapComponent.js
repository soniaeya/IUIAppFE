
import React, { useEffect, useState, useRef } from 'react';
import {View, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator, Text} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from "axios";
import RecommendationBox from "./RecommendationBox";


export default function MapComponent() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const searchRef = useRef(null);
    const [mapSearchQuery, setMapSearchQuery] = useState("");
    const [ratings, setRatings] = useState({});


    const [selectedLocation, setSelectedLocation] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [currentGymIndex, setCurrentGymIndex] = useState(0);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await axios.get("http://10.0.2.2:8000/recommendations");
                setRecommendations(res.data.gyms || []);
            } catch (err) {
                console.error("Error fetching recommendations", err);
            }
        };

        fetchRecommendations();
    }, []);

    const selectLocationByName = async (name) => {
        if (searchRef.current) {
            searchRef.current.setAddressText(name);
        }
        setMapSearchQuery(name);   // keep text input in sync

        await selectFirstPlaceForText(name);  // does the actual Google lookup + handlePlaceSelect
    };





    const BASE_URL =
        Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
    const sendLocationToBackend = async (coords) => {
        try {
            const response = await axios.post(`${BASE_URL}/map/location`, {
                latitude: coords.latitude,
                longitude: coords.longitude,
            });

            console.log("Location sent to backend:", response.data);
        } catch (err) {
            if (err.response) {
                console.log("Backend error:", err.response.data);
            } else {
                console.log("Network error sending location:", err.message);
            }
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                console.log('Location retrieved:', position.coords);
                const { latitude, longitude } = position.coords;

                const coords = { latitude, longitude };

                setLocation(coords);
                setLoading(false);

                // ⭐ SEND TO BACKEND HERE
                sendLocationToBackend(coords);
            },
            error => {
                console.log('Geolocation error:', error);
                setError(`Location error: ${error.message}`);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
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




    const goToIndex = async (idx) => {
        if (!recommendations.length) return;

        const boundedIdx = (idx + recommendations.length) % recommendations.length;
        const name = recommendations[boundedIdx];

        setCurrentIdx(boundedIdx);
        await selectFirstPlaceForText(name);  // this will update selectedLocation
    };



    const handleNextRecommendation = async () => {
        await goToIndex(currentIdx + 1);
    };

    const handlePrevRecommendation = async () => {
        await goToIndex(currentIdx - 1);
    };
    const handleSetRating = (placeId, value) => {
        setRatings(prev => ({
            ...prev,
            [placeId]: value,
        }));
        // optional: POST/PUT to backend here
    };

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


        // Postal code (H2X 1K4 → prefix H2X if you want)
        const postalComp = details.address_components?.find(comp =>
            comp.types.includes('postal_code')
        );
        const postalCode = postalComp?.long_name || '';

        // Is it open now?
        const isOpenNow = details.current_opening_hours?.open_now ?? false;

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
            name: details.name,                                   // "UNDERDOG BOXING GYM"
            address: shortAddress,                 // full address
            phone: details.formatted_phone_number,                // "(514) 843-5164"
            website: details.website,                             // gym site
            rating: details.rating,                               // 4.6
            totalRatings: details.user_ratings_total,             // 70
            isOpenNow,
            todaysHours,
            postalCode,
            placeId,
        });




        console.log("Selected location:", newLocation);
        sendLocationToBackend(newLocation);



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

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>

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


            <RecommendationBox
            selectedLocation={selectedLocation}
            onNextRecommendation={handleNextRecommendation}
            onPrevRecommendation={handlePrevRecommendation}
            ratings={ratings}
            onSetRating={handleSetRating}
            />





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
                        coordinate={location}
                        title="Your Location"
                        description="You are here"
                        pinColor="blue"
                    />
                    {selectedLocation && (
                        <Marker
                            coordinate={selectedLocation}
                            title="Selected Location"
                            pinColor="red"
                        />
                    )}
                </MapView>
            ) : null}
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
});