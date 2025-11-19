import React, { useState } from 'react';

import {
    View,
    StyleSheet, Text,

} from 'react-native';
import MapComponent from "./MapComponent";
import {Button, DataTable, Dialog, List, Portal} from 'react-native-paper';
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";
import UserPreferencesScreen from "../UserPreferenceScreen/UserPreferencesScreen";
import {useNavigation} from "@react-navigation/native";
import axios from "axios";


const highlight = "#6f4b63"

export default function MapScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDestination, setSelectedDestination] = useState(null);





    const [returnTorPreferencesScreen] = useState(false);
    const [location, setLocation] = useState(null);





    const handleNavigationToPreferencesScreen = async () => {
            navigation.navigate(UserPreferencesScreen);

        };



    return (
        <View style={styles.container}>
            <MapComponent></MapComponent>


            <MaterialDesignIcons

                name="account-circle-outline"
                color={highlight}
                size={60}
                style={{
                    position: 'absolute',
                    right: '2%',
                    bottom: '3%',
                }}
                onPress={handleNavigationToPreferencesScreen}

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