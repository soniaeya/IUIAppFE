import * as React from 'react';
import { View, StyleSheet ,   I18nManager,
    Image,
    ImageSourcePropType,
    Platform } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import axios from "axios";
import * as navigation from "@react-navigation/routers/src/CommonActions";



export default function ActivitySearchBar({ value, onChange }) {
    /*const [searchQuery, setSearchQuery] = React.useState('');*/

    /*const onChangeSearch = query => setSearchQuery(query);*/

    const handleSearch = async () => {
        /*setLoading(true);*/
        try {
/*            const response = await axios.put("http://10.0.2.2:8000/map/search", {
                value
            });*/

            /*        navigation.navigate('');*/
        } catch (error) {

            if (error.response) {
            } else {
                alert("Could not reach server");
            }
        } finally {

        }
    };
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
