import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

export default function UserPreferencePopup({ visible, hideDialog }) {
    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={hideDialog}
                style={styles.dialogContainer}
            >
                <Dialog.Title>User Preferences</Dialog.Title>

                <Dialog.Content>
                    <View style={styles.popupContent}>
                        {/* ✅ Make sure the Text color contrasts the background */}
                        <Text style={styles.text}>
                            This popup has a fixed height of 800px! 🎉
                        </Text>
                    </View>
                </Dialog.Content>

                <Dialog.Actions>
                    <Button onPress={hideDialog}>Close</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialogContainer: {
        alignSelf: 'center',
        width: '90%',
        borderRadius: 12,
    },
    popupContent: {

        backgroundColor: "black", // light purple to make text stand out
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    text: {
        fontSize: 18,
        color: '#222', // dark text color to be visible
        textAlign: 'center',
    },
});
