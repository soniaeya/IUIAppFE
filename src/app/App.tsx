/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View , Text} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import PreferencesScreen from "../features/preferences/screens/PreferencesScreen";

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
      <PaperProvider>
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
          </PaperProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <PreferencesScreen

      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
      backgroundColor: '#C2B280',
  },
});

export default App;
