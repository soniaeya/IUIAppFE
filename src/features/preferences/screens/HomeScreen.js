import { View, Text } from 'react-native';
import { gs } from '../../../ui/theme/GlobalStyles';
export default function HomeScreen() {
    return (
        <View style={gs.screen}>
            <Text style={gs.h1}>Welcome</Text>
            <View style={[gs.card, gs.mt]}>
                <Text style={gs.body}>Shared card style!</Text>
            </View>
        </View>
    );
}
