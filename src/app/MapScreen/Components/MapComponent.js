
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


    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentGymIndex, setCurrentGymIndex] = useState(0);
    const gyms = ["Underdog Montreal", "Hard Knox Montreal", "Concordia University"];

    const writeToSearchBar = (nextName) => {
        if (!searchRef.current) return;          // ref not ready yet

        // Set the visible text in the search bar
        searchRef.current.setAddressText(nextName);

        // Trigger autocomplete search (only if method exists)
        if (searchRef.current._handleChangeText) {
            searchRef.current._handleChangeText(nextName);
        }
        return nextName;
    }
    const GOOGLE_API_KEY = "AIzaSyDgne1zVrGt-GIf8s2ayoNs6kE3O4iVUXc"; // or reuse the same you already use

// This mimics "select the first autocomplete result for this text"
    const selectFirstPlaceForText = async (text) => {
        if (!text || !text.trim()) return;

        try {
            // 1) Find a place from text (like the first autocomplete result)
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
            if (candidates.length === 0) {
                console.log("No candidates for text:", text);
                return;
            }

            const first = candidates[0];

            // 2) (Optional but nicer) get full details using place_id
            const detailsResp = await axios.get(
                "https://maps.googleapis.com/maps/api/place/details/json",
                {
                    params: {
                        place_id: first.place_id,
                        key: "AIzaSyDgne1zVrGt-GIf8s2ayoNs6kE3O4iVUXc",
                        fields:
                            "name,geometry,formatted_address,photos," +
                            "formatted_phone_number,website,rating,user_ratings_total," +
                            "opening_hours,address_components",
                    },
                }
            );

            const details = detailsResp.data.result;
            if (!details) return;

            // 3) Reuse your existing logic that runs when user taps a result
            //    (if you want, you can pull the useful parts out of handlePlaceSelect
            //     into a separate function and call it here)
            handlePlaceSelect({ description: text }, details);
        } catch (err) {
            console.log("Error selecting first place:", err.message);
        }
    };


    const handleNextRecommendation = async () => {
        const nextIndex = (currentGymIndex + 1) % gyms.length;
        const nextName = gyms[nextIndex];

        setCurrentGymIndex(nextIndex);

        // optional: keep your visual search bar in sync
        if (searchRef.current) {
            searchRef.current.setAddressText(nextName);
        }

        // 🔥 This line effectively "selects the first option"
        await selectFirstPlaceForText(nextName);

        return nextName;
    };


    const handlePrevRecommendation = async () => {
        const prevIndex =
            (currentGymIndex - 1 + gyms.length) % gyms.length;
        const prevName = gyms[prevIndex];

        setCurrentGymIndex(prevIndex);

        // Update visible search bar
        if (searchRef.current) {
            searchRef.current.setAddressText(prevName);
        }

        // Auto-select first result
        await selectFirstPlaceForText(prevName);

        return prevName;
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

        const getCurrentLocation = () => {
            Geolocation.getCurrentPosition(
                position => {
                    console.log('Location retrieved:', position.coords);
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                    setLoading(false);
                },
                error => {
                    console.log('Geolocation error:', error);
                    setError(`Location error: ${error.message}`);
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        };

        requestLocationPermission();
    }, []);

    const handleSearch = async () => {
        try {
            const response = await axios.put("http://10.0.2.2:8000/map/search", {
                searchQuery: mapSearchQuery,
            });
            console.log("Server response:", response.data);
        } catch (error) {
            if (error.response) {
                console.log("STATUS:", error.response.status);
                console.log("DATA:", error.response.data);
            } else {
                console.log("NETWORK ERROR:", error.message);
                alert("Could not reach server");
            }
        }

    }


   const getShortAddress = (details) => {
        const comps = details.address_components || [];

        const streetNumber = comps.find(c => c.types.includes('street_number'))?.long_name || '';
        const route        = comps.find(c => c.types.includes('route'))?.long_name || '';

        return `${streetNumber} ${route}`.trim().replace(/^, /, '');
    };
    const handlePlaceSelect = (data, details) => {

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

            {selectedLocation?.photo && <RecommendationBox
                selectedLocation={selectedLocation}
                onNextRecommendation={handleNextRecommendation}
                onPrevRecommendation={handlePrevRecommendation}
            />
            }


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