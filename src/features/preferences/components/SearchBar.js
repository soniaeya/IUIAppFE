import * as React from 'react';
import { View, StyleSheet ,   I18nManager,
    Image,
    ImageSourcePropType,
    Platform } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';

export default function SearchBar({ value, onChange }) {
    const [searchQuery, setSearchQuery] = React.useState('');

    const onChangeSearch = query => setSearchQuery(query);

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search here..."
                onChangeText={onChange}
                value={value}
                style={styles.searchbar}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 0,
        padding: 0
    },
    searchbar: {
        marginTop: 0
    },

});
