
import React, { useEffect, useState, useRef } from 'react';
import {View, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator, Text, Image} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from "axios";

import styled from 'styled-components/native';
import {Title} from "react-native-paper";
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function MapComponent() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const mapRef = useRef(null);

    const [mapSearchQuery, setMapSearchQuery] = useState("");






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
        }

        catch (error) {
            if (error.response) {
                console.log("STATUS:", error.response.status);
                console.log("DATA:", error.response.data);
            } else {
                console.log("NETWORK ERROR:", error.message);
                alert("Could not reach server");
            }
        }

    }
    const photoRef = null;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=AIzaSyDgne1zVrGt-GIf8s2ayoNs6kE3O4iVUXc`;
    const getShortAddress = (details) => {
        const comps = details.address_components || [];

        const streetNumber = comps.find(c => c.types.includes('street_number'))?.long_name || '';
        const route        = comps.find(c => c.types.includes('route'))?.long_name || '';
        const city         = comps.find(c => c.types.includes('locality'))?.long_name || '';

        // "9 Rue Sainte-Catherine E, Montréal"
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
                        onSubmitEditing: () => {
                            handleSearch();
                        }
                    }}

                    onFail={(error) => {
                        console.log("GOOGLE PLACES ERROR:", error);
                    }}

                    onNotFound={() => console.log("NO RESULTS FOUND")}

                    styles={{
                        container: { flex: 0 },
                        textInput: {
                            height: 44,
                            fontSize: 16,
                            borderWidth: 1,
                            borderColor: "#ddd",
                            borderRadius: 8,
                        },
                        listView: {
                            backgroundColor: "white",
                            zIndex: 10,
                            elevation: 10,
                        }
                    }}
                />


            </View>

            {selectedLocation?.photo && (

                <RecommendationContainer>
                    <MaterialDesignIcons

                        name="chevron-right"
                        size={40}
                        style={{
                            position: 'absolute',
                            right: 0,
                            bottom: -75,
                            zIndex: 999,
                        }}
                        onPress={{}}


                    />
                    <MaterialDesignIcons

                        name="chevron-left"
                        size={40}
                        style={{
                            position: 'absolute',
                            left: 0,
                            bottom: -75,
                            zIndex: 999,
                        }}
                        onPress={{}}

                    />
                    <RecommendationInfoContainer>
                        <GymTitle>
                            {selectedLocation.name}
                        </GymTitle>
                        <StatsContainer>
                            <StatsText>Your Rating</StatsText>:{'\n'}
                            <StatsText>User Rating</StatsText>: {selectedLocation.rating} ★ ({selectedLocation.totalRatings}){'\n'}
                                <StatsText>Opened</StatsText>: {selectedLocation.isOpenNow
                                    ? <OpenText>Open</OpenText>
                                    : <CloseText>Closed</CloseText>
                        }
                        {'\n'}
                                    <StatsText>Address</StatsText>: {selectedLocation.address}
                            {'\n'}
                                        <StatsText>Tel</StatsText>: {selectedLocation.phone}

                        </StatsContainer>


                    </RecommendationInfoContainer>
                    <ImageContainer>
                        <Image
                            source={{ uri: selectedLocation.photo }}
                            style={{ width: '100%', height: 200, marginTop: 5, borderRadius: 20 }}
                        />
                    </ImageContainer>

                </RecommendationContainer>

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

const RecommendationContainer = styled.View`

    top: 70px;
    
    height: 300px;
    width: 100%;
    background-color: #c8a2c8;
`;


const RecommendationInfoContainer = styled.View`
    border-radius: 16px;
    
    margin: 10px;
    z-index: 0;
    height: 200px;
    width: 40%;
    background-color: #c8a2c8;
`;

const GymTitle = styled.Text`
    font-family: 'Roboto-Bold';
    font-weight: bold;

    font-size: 15px;
    padding: 10px;
    padding-bottom: 0px;
    line-height: 18px;

`;

const OpenText = styled.Text`
    font-family: 'Roboto-Regular';
    font-size: 12px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
    color: darkolivegreen;
`;

const CloseText = styled.Text`
    font-family: 'Roboto-Regular';
    font-size: 12px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
    color: darkred;
`;
const StatsText = styled.Text`
    font-family: 'Roboto-Regular';
    font-size: 13px;
    font-weight: bold;
`;

const ImageContainer = styled.View`

    padding: 10px;
    position: absolute;
    left: 45%;

    height: 300px;
    width: 55%;
    background-color: #dbbdab;
`;

const StatsContainer = styled.Text`
    font-family: 'Roboto-Regular';
    font-size: 13px;
    padding: 10px;
    line-height: 18px;
    z-index: 999;
`;


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    searchContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
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