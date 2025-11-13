import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    FlatList,
    Text,
    TouchableOpacity
} from 'react-native';
import MapComponent from "../components/MapComponent";

export default function DestinationsScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDestination, setSelectedDestination] = useState(null);

    const mockDestinations = [
        { id: '1', name: 'Paris', country: 'France' },
        { id: '2', name: 'London', country: 'United Kingdom' },
        { id: '3', name: 'Tokyo', country: 'Japan' },
        { id: '4', name: 'New York', country: 'United States' },
        { id: '5', name: 'Barcelona', country: 'Spain' },
    ];

    const filteredDestinations = searchQuery.length > 0
        ? mockDestinations.filter(dest =>
            dest.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search Destinations</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Type to search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {filteredDestinations.length > 0 && (
                <FlatList
                    data={filteredDestinations}
                    keyExtractor={(item) => item.id}
                    style={styles.resultsList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.resultItem}
                            onPress={() => {
                                setSelectedDestination(item);
                                setSearchQuery(item.name);
                            }}
                        >
                            <Text style={styles.resultName}>{item.name}</Text>
                            <Text style={styles.resultCountry}>{item.country}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            {selectedDestination && (
                <View style={styles.selectedBox}>
                    <Text style={styles.selectedText}>
                        Selected: {selectedDestination.name}
                    </Text>
                </View>
            )}
            <MapComponent></MapComponent>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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