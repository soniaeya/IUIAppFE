import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

export default function MapScreen() {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const requestLocationPermission = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentLocation();
                }
            } else {
                getCurrentLocation();
            }
        };

        const getCurrentLocation = () => {
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                },
                error => console.log(error),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        };

        requestLocationPermission();
    }, []);

    return (
        <View style={styles.container}>
            {location ? (
                <MapView
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
                        title="You are here"
                        description="This is your current location"
                    />
                </MapView>
            ) : null}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        height: 200
    },
    map: {
        height: 200
    },
});
