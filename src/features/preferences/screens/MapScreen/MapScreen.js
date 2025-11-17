import React, { useState } from 'react';

import {
    View,
    StyleSheet, Text,

} from 'react-native';
import MapComponent from "./MapComponent";
import UserPreferencePopup from "../../components/UserPreferencePopup";
import {Button, DataTable, Dialog, List, Portal} from 'react-native-paper';
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SignupPreferencesScreen from "../SignupScreen/SignupPreferencesScreen";
import {useNavigation} from "@react-navigation/native";
import axios from "axios";




export default function MapScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDestination, setSelectedDestination] = useState(null);

    const [isUserPreferencesPopupVisible, setIsUserPreferencesPopupVisible] = useState(false);
    const [isUserRecommendationListPopupVisible, setIsUserRecommendationListPopupVisible] = useState(false);


    const openUserPreferencesPopup = () => {

        navigation.navigate("AccountScreen");
    }

    const closeUserPreferencesPopup = () => setIsUserPreferencesPopupVisible(false);
    const closeUserRecommendationListPopup = () => setIsUserRecommendationListPopupVisible(false);

    const [returnTorPreferencesScreen] = useState(false);
    const [location, setLocation] = useState(null);





    const handleNavigationToPreferencesScreen = async () => {
            navigation.navigate(SignupPreferencesScreen);

        };



    return (
        <View style={styles.container}>
            <MapComponent></MapComponent>


            <MaterialDesignIcons

                name="logout"
                size={40}
                style={{
                    position: 'absolute',
                    right: '2%',
                    bottom: '3%',
                }}
                onPress={handleNavigationToPreferencesScreen}

            />

            <MaterialDesignIcons

                name="folder-heart"
                size={40}
                style={{
                    position: 'absolute',
                    right: '2%',
                    bottom: '13%',
                }}
                onPress={openUserPreferencesPopup}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    searchInput: {
        height: 50,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    resultsList: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        maxHeight: 300,
    },
    resultItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultName: {
        fontSize: 18,
        fontWeight: '500',
    },
    resultCountry: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    selectedBox: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
    },
    selectedText: {
        fontSize: 16,
        fontWeight: '600',
    },
});