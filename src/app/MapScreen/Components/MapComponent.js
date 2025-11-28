
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {View, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from "axios";
import RecommendationBox from "./RecommendationBox";
import LoadingRecommendation from "./LoadingRecommendation";
import { useFocusEffect } from '@react-navigation/native';
import CustomAlert from "../../UserPreferenceScreen/Components/CustomAlert";


// Move Google API key to a constant (consider moving to env file later)
const GOOGLE_API_KEY = 'AIzaSyDgne1zVrGt-GIf8s2ayoNs6kE3O4iVUXc';

export default function MapComponent({ userId  }) {
  const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

  // Refs
  const hasFetchedOnce = useRef(false);
  const lastPrefsTimeRef = useRef(null);
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const lastLocationSourceRef = useRef("backend");
  const lastServerTimeRef = useRef(null);

  // State
  const [recUiVersion, setRecUiVersion] = useState(0);
  const [recExpanded, setRecExpanded] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [preferredTime, setPreferredTime] = useState(null);
  const [ratings, setRatings] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [timeUpdateModalVisible, setTimeUpdateModalVisible] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recLoading, setRecLoading] = useState(true);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [locationPopupVisible, setLocationPopupVisible] = useState(false);
  const [timeChangeModalVisible, setTimeChangeModalVisible] = useState(false);
  const [lastTimeString, setLastTimeString] = useState("");
  const [currentTimeString, setCurrentTimeString] = useState("");
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [noRecsModalVisible, setNoRecsModalVisible] = useState(false);
  const [allRecsClosedModalVisible, setAllRecsClosedModalVisible] = useState(false); // New state for "all closed" alert
  const [showRecommendationBox, setShowRecommendationBox] = useState(true); // New state to control visibility

  const lastWeatherRef = useRef(null);
  const hasWeatherLoadedRef = useRef(false);
  const lastDeviceTimeRef = useRef(new Date()); // New ref to store the last checked device time
  // Utility functions
  const buildPreferredTimeToday = useCallback(() => {
    if (!preferredTime) return null;
    const now = new Date();
    const d = new Date(now);
    d.setHours(preferredTime.getHours(), preferredTime.getMinutes(), 0, 0);
    return d;
  }, [preferredTime]);

  const formatTime = useCallback((date) =>
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    , []);

  const checkIfOpen = useCallback((periods, now) => {
    if (!periods || !Array.isArray(periods)) return false;

    const day = now.getDay();
    const time = now.getHours() * 100 + now.getMinutes();

    for (const p of periods) {
      const open = p.open;
      const close = p.close;

      if (!open || open.day == null) continue;
      if (open.day !== day) continue;

      const openTime = parseInt(open.time);
      const closeTime = parseInt(close?.time || "2359");

      if (time >= openTime && time < closeTime) return true;

      if (close && close.day !== open.day) {
        if (time >= openTime || time < parseInt(close.time)) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const toRad = useCallback((deg) => (deg * Math.PI) / 180, []);

  const getDistanceKm = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
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
  }, [toRad]);

  const getShortAddress = useCallback((details) => {
    const comps = details.address_components || [];
    const streetNumber = comps.find(c => c.types.includes('street_number'))?.long_name || '';
    const route = comps.find(c => c.types.includes('route'))?.long_name || '';
    return `${streetNumber} ${route}`.trim().replace(/^, /, '');
  }, []);

  // Weather functions
  const getWeatherBarStyle = useCallback((main) => {
    if (["Rain", "Drizzle", "Thunderstorm"].includes(main)) {
      return { backgroundColor: "#3b82f6" };
    }
    if (["Snow"].includes(main)) {
      return { backgroundColor: "#60a5fa" };
    }
    if (["Clear"].includes(main)) {
      return { backgroundColor: "#22c55e" };
    }
    if (["Clouds"].includes(main)) {
      return { backgroundColor: "#9ca3af" };
    }
    return { backgroundColor: "#6f4b63" };
  }, []);

  const renderWeatherMessage = useCallback((info) => {
    const main = info.main;

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
  }, []);

  // Location update function
  const updateUserLocation = useCallback(async (coords, options = {}) => {
    const {
      skipBackend = false,
      showPopup = false,
      source = "device",
    } = options;

    lastLocationSourceRef.current = source;

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

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000
      );
    }

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
  }, [userId, BASE_URL]);

  // Fetch recommendations - fixed with proper dependencies
  // Fetch recommendations - fixed with proper dependencies
  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;

    setRecLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/recommendations`, {
        params: { user_id: userId },
      });

      const recs = res.data.recommendations || [];
      setRecommendations(recs);
      setAllRecsClosedModalVisible(false); // Reset this modal when new recommendations are fetched.
      setShowRecommendationBox(true); // Show recommendation box when new recommendations are fetched

      // Show modal if no recommendations after loading
      if (recs.length === 0) {
        setNoRecsModalVisible(true);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        console.log("➡️ Preferences not set yet. Skipping recommendations.");
        setRecommendations([]);
        setRecLoading(false);
        return;
      }
      console.error(
        "Error fetching recommendations",
        err.response?.data || err.message
      );
    } finally {
      setRecLoading(false);
    }
  }, [userId, BASE_URL]);

  // Backend location fetch
  const fetchBackendLocation = useCallback(async (showPopupOnChange = false) => {
    if (!userId) return;

    try {
      const res = await axios.get(`${BASE_URL}/user/location`, {
        params: { user_id: userId },
      });


      const { latitude, longitude } = res.data || {};
      if (latitude == null || longitude == null) {
        console.log("Backend has no location yet");
        return;
      }

      const coords = { latitude, longitude };

      await updateUserLocation(coords, {
        skipBackend: true,
        showPopup: showPopupOnChange,
        source: "backend",
      });
    } catch (err) {
      console.log(
        "Could not fetch backend location:",
        err.response?.data || err.message
      );
    }
  }, [userId, BASE_URL, updateUserLocation]);

  // Get current location from device
  const getCurrentLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { latitude, longitude };


        if (lastLocationSourceRef.current === "backend") {
          setLoading(false);
          return;
        }

        const isFirstTime = !hasFetchedOnce.current;
        hasFetchedOnce.current = true;

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
  }, [updateUserLocation]);
  const handlePlaceSelect = useCallback((data, details) => {
    const placeId = details.place_id;
    const shortAddress = getShortAddress(details);

    let photoUrl = null;
    if (details.photos && details.photos.length > 0) {
      const photoRef = details.photos[0].photo_reference;
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
    }

    const periods = details.opening_hours?.periods || [];
    const deviceDate = new Date();

    const recomputedOpen = checkIfOpen(periods, deviceDate);

    let openAtPreferredTime = false;
    const prefDate = buildPreferredTimeToday();
    if (prefDate) {
      openAtPreferredTime = checkIfOpen(periods, prefDate);
    }

    const postalComp = details.address_components?.find(comp =>
      comp.types.includes('postal_code')
    );
    const postalCode = postalComp?.long_name || '';

    let todaysHours = '';
    if (details.current_opening_hours?.weekday_text) {
      const todayIndex = new Date().getDay();
      const index = (todayIndex + 6) % 7;
      todaysHours = details.current_opening_hours.weekday_text[index];
    }

    console.log("Selected place:", details);
    const { lat, lng } = details.geometry.location;

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
      openAtPreferredTime,
    });

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
  }, [getShortAddress, checkIfOpen, buildPreferredTimeToday]);

  // Place selection functions
  const selectFirstPlaceForText = useCallback(async (text) => {
    try {
      const findResp = await axios.get(
        "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
        {
          params: {
            input: text,
            inputtype: "textquery",
            fields: "place_id,name,geometry,formatted_address,photos,opening_hours",
            key: GOOGLE_API_KEY,
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
            key: GOOGLE_API_KEY,
            fields:
              "place_id,name,geometry,formatted_address,photos," +
              "formatted_phone_number,website,rating,user_ratings_total," +
              "opening_hours,address_components",
          },
        }
      );

      const details = detailsResp.data.result;
      console.log("details.place_id from Next/Prev:", details.place_id);

      if (!details) {
        console.log("No details for first candidate");
        return;
      }

      handlePlaceSelect({ description: text }, details);
      return details;
    } catch (err) {
      console.log("Error selecting first place:", err.message, err.response?.data);
    }
  }, [handlePlaceSelect]);


  const selectLocationByName = useCallback(async (name) => {
    if (searchRef.current) {
      searchRef.current.setAddressText(name);
    }

    setMapSearchQuery(name);
    await selectFirstPlaceForText(name);
  }, [selectFirstPlaceForText]);

  // Recommendation navigation
  const skipClosed = useCallback(async (startIdx, step) => {
    if (!recommendations.length) return;

    let tries = 0;
    let currentIndex = startIdx;

    const now = new Date();
    const prefDate = buildPreferredTimeToday();

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

      if (isOpenNow || isOpenAtPreferred) {
        setCurrentIdx(currentIndex);
        setAllRecsClosedModalVisible(false); // Hide the modal if an open place is found
        setShowRecommendationBox(true); // Show recommendation box
        return;
      }

      currentIndex = (currentIndex + step + recommendations.length) % recommendations.length;
      tries++;
    }
    if (tries === recommendations.length) {
      setAllRecsClosedModalVisible(true); // Show the "all closed" modal
      setShowRecommendationBox(false); // Hide recommendation box
    }
  }, [recommendations, buildPreferredTimeToday, selectFirstPlaceForText, checkIfOpen]);

  const handleNextRecommendation = useCallback(async () => {
    await skipClosed(currentIdx + 1, +1);
  }, [skipClosed, currentIdx]);

  const handlePrevRecommendation = useCallback(async () => {
    await skipClosed(currentIdx - 1, -1);
  }, [skipClosed, currentIdx]);

  const handleSetRating = useCallback((placeId, value) => {
    setRatings(prev => ({
      ...prev,
      [placeId]: value,
    }));
  }, []);

  // Initial location permission request
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
  }, [getCurrentLocation]);

  // Load initial backend location
  useEffect(() => {
    if (!userId || location) return;
    fetchBackendLocation(false);
  }, [userId, location, fetchBackendLocation]);

  // Fetch recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Fetch ratings on mount
  useEffect(() => {
    if (!userId) return;

    const fetchRatings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/ratings/`, {
          params: { user_id: userId },
        });

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

  // Poll backend location periodically
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchBackendLocation(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [userId, fetchBackendLocation]);

  // Poll device location periodically
  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentLocation();
      // Check for device time changes
      const now = new Date();
      if (Math.abs(now.getTime() - lastDeviceTimeRef.current.getTime()) > 60 * 1000) { // If time differs by more than 1 minute
        setLastTimeString(formatTime(lastDeviceTimeRef.current));
        setCurrentTimeString(formatTime(now));
        setTimeChangeModalVisible(true);
      }
      lastDeviceTimeRef.current = now; // Update the last device time


    }, 5000);

    return () => clearInterval(interval);
  }, [getCurrentLocation, formatTime]);

  // Poll for backend time changes
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/time`, {
          params: { user_id: userId },
        });

        const serverIso = res.data?.time;
        if (!serverIso) return;

        if (!lastServerTimeRef.current) {
          lastServerTimeRef.current = serverIso;
          setPreferredTime(new Date(serverIso));
          return;
        }

        if (lastServerTimeRef.current !== serverIso) {
          console.log("⏰ Detected server /user/time change:", serverIso);
          lastServerTimeRef.current = serverIso;

          const newDate = new Date(serverIso);
          setPreferredTime(newDate);
          setTimeUpdateModalVisible(true);

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
    }, 10000);

    return () => clearInterval(interval);
  }, [userId, BASE_URL, fetchRecommendations]);

  // Handle preferred time changes
  useEffect(() => {
    if (!preferredTime) return;

    console.log("⏰ Preferred time changed:", preferredTime.toISOString());

    fetchRecommendations();
    setRecExpanded(true);
    setRecUiVersion(v => v + 1);
    setCurrentIdx(0);

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
  }, [preferredTime, fetchRecommendations, buildPreferredTimeToday, checkIfOpen]);

  // Test weather (remove this in production)




  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let isMounted = true;

      const fetchWeather = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/user/weather`, {
            params: { user_id: userId },
          });

          const data = res.data.weather || res.data;

          if (!isMounted || !data) return;

          // 🌦️ Detect change vs previous weather
          const prev = lastWeatherRef.current;
          const hasPrev = hasWeatherLoadedRef.current;

          // Example rule: show modal if `main` changed
          if (
            hasPrev &&
            prev &&
            prev.main !== data.main
          ) {
            setShowWeatherModal(true);
          }

          // Update refs for next comparison
          lastWeatherRef.current = data;
          hasWeatherLoadedRef.current = true;

          // Update UI state
          setWeatherInfo({
            main: data.main,
            description: data.description,
            temp: data.temp_c,
          });
        } catch (err) {
          console.log(
            "Error fetching weather:",
            err.response?.data || err.message
          );
        }
      };


      fetchWeather();
      const intervalId = setInterval(fetchWeather, 5000);

      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }, [userId, BASE_URL])
  );



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
        <CustomAlert
          visible={noRecsModalVisible}
          title="No Recommendations"
          message="There are no recommendations available at this time. Please check your preferences or try again later."
          onClose={() => setNoRecsModalVisible(false)}
        />
        <CustomAlert // New alert for when all recommendations are closed
          visible={allRecsClosedModalVisible}
          title="All Recommendations Closed"
          message="It looks like all recommended places are currently closed or will be closed at your preferred time. You might want to adjust your preferences."
          onClose={() => setAllRecsClosedModalVisible(false)}
        />
        {weatherInfo && (
          <View
            style={[
              styles.weatherBar,
              getWeatherBarStyle(weatherInfo.main),
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
            key: GOOGLE_API_KEY,
            language: 'en',
          }}
          predefinedPlaces={[]}
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

        <LoadingRecommendation />

        )
        :
        (showRecommendationBox && (
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
        />)
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

      {showWeatherModal && weatherInfo && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Weather Updated</Text>
            <Text style={styles.modalText}>
              {`Weather is now ${weatherInfo.main}${
                weatherInfo.description ? ` – ${weatherInfo.description}` : ""
              }.`}
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
  weatherBar: {
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  weatherBarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modalBox: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
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