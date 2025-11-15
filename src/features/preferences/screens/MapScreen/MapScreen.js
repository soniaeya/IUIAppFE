import React, { useState } from 'react';

import {
    View,
    StyleSheet, Text,

} from 'react-native';
import MapComponent from "./MapComponent";
import UserPreferencePopup from "../../components/UserPreferencePopup";
import {Button, DataTable, Dialog, List, Portal} from 'react-native-paper';
import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons";
import PreferencesScreen from "../PreferenceScreen/PreferencesScreen";
import {useNavigation} from "@react-navigation/native";
import axios from "axios";


export default function MapScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDestination, setSelectedDestination] = useState(null);

    const [isUserPreferencesPopupVisible, setIsUserPreferencesPopupVisible] = useState(false);
    const [isUserRecommendationListPopupVisible, setIsUserRecommendationListPopupVisible] = useState(false);


    const openUserPreferencesPopup = () => setIsUserPreferencesPopupVisible(true);
    const openUserRecommendationListPopup = () => setIsUserRecommendationListPopupVisible(true);
    const closeUserPreferencesPopup = () => setIsUserPreferencesPopupVisible(false);
    const closeUserRecommendationListPopup = () => setIsUserRecommendationListPopupVisible(false);

    const [returnTorPreferencesScreen] = useState(false);
    const [location, setLocation] = useState(null);





    const handleNavigationToPreferencesScreen = async () => {
            navigation.navigate(PreferencesScreen);

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
                    bottom: '23%',
                }}
                onPress={handleNavigationToPreferencesScreen}

            />
            <MaterialDesignIcons

                name="format-list-bulleted"
                size={40}
                style={{
                    position: 'absolute',
                    right: '2%',
                    bottom: '12%',
                }}
                onPress={openUserRecommendationListPopup}
            />
            <MaterialDesignIcons

                name="folder-heart"
                size={40}
                style={{
                    position: 'absolute',
                    right: '2%',
                    bottom: '3%',
                }}
                onPress={openUserPreferencesPopup}
            />
            <Portal>
                <Dialog visible={isUserPreferencesPopupVisible} onDismiss={closeUserPreferencesPopup}>
                    <Dialog.Title>User Preferences</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            {"\n"}
                            Time ⏱️: 6:30PM
                            {"\n"}
                            {"\n"}
                            {"\n"}
                            {"\n"}
                            Activity 🥊: Boxing
                            {"\n"}
                            {"\n"}
                            {"\n"}
                            {"\n"}
                            Environment 🌴: Indoors
                            </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={closeUserPreferencesPopup}>Close</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Portal>
                <Dialog visible={isUserRecommendationListPopupVisible} onDismiss={closeUserRecommendationListPopup}>
                    <Dialog.Title>Recommendations to the User</Dialog.Title>

                    <Dialog.Content>
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title>Activity</DataTable.Title>
                                <DataTable.Title>Type</DataTable.Title>
                                <DataTable.Title>Suggested Time</DataTable.Title>
                            </DataTable.Header>

                            <DataTable.Row>
                                <DataTable.Cell>Visit Park</DataTable.Cell>
                                <DataTable.Cell>Outdoor</DataTable.Cell>
                                <DataTable.Cell>Morning</DataTable.Cell>
                            </DataTable.Row>

                            <DataTable.Row>
                                <DataTable.Cell>Museum</DataTable.Cell>
                                <DataTable.Cell>Indoor</DataTable.Cell>
                                <DataTable.Cell>Afternoon</DataTable.Cell>
                            </DataTable.Row>

                            <DataTable.Row>
                                <DataTable.Cell>Café Meetup</DataTable.Cell>
                                <DataTable.Cell>Leisure</DataTable.Cell>
                                <DataTable.Cell>Evening</DataTable.Cell>
                            </DataTable.Row>

                            <DataTable.Row>
                                <DataTable.Cell>Yoga Class</DataTable.Cell>
                                <DataTable.Cell>Indoor</DataTable.Cell>
                                <DataTable.Cell>Morning</DataTable.Cell>
                            </DataTable.Row>
                        </DataTable>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={closeUserRecommendationListPopup}>Close</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>


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