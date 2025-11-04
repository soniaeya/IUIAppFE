// HomeScreen.js
import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Text, Button, Avatar, FAB } from 'react-native-paper';
import MapScreen from './MapScreen';

const LeftAvatar = props => <Avatar.Icon {...props} icon="star" />;

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Top App Bar */}
            <Appbar.Header>
                <Appbar.Content title="Home" subtitle="Welcome back 👋" />
                <Appbar.Action icon="magnify" onPress={() => {}} />
                <Appbar.Action icon="cog" onPress={() => navigation?.navigate?.('Settings')} />
            </Appbar.Header>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.greeting}>
                    Hi Sonia,
                </Text>
                <MapScreen style={{ height: '100px'}}></MapScreen>
                <Text variant="bodyMedium" style={styles.subtext}>
                    Here’s a quick overview of your app.
                </Text>

                {/* Example Card 1 */}
                <Card style={styles.card} onPress={() => navigation?.navigate?.('Details')}>
                    <Card.Title
                        title="Today’s Summary"
                        subtitle="See what changed since yesterday"
                        left={LeftAvatar}
                    />
                    <Card.Content>
                        <Text variant="bodyMedium">
                            • 3 new notifications{"\n"}
                            • 2 tasks due today{"\n"}
                            • 1 pending review
                        </Text>
                    </Card.Content>
                    <Card.Actions>
                        <Button onPress={() => navigation?.navigate?.('Details')}>View details</Button>
                    </Card.Actions>
                </Card>

                {/* Example Card 2 */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium">Quick Actions</Text>
                        <Text variant="bodyMedium" style={{ marginTop: 4 }}>
                            Jump straight into the most common actions.
                        </Text>
                    </Card.Content>
                    <Card.Actions>
                        <Button mode="contained" onPress={() => navigation?.navigate?.('NewItem')}>
                            New item
                        </Button>
                        <Button onPress={() => navigation?.navigate?.('History')}>History</Button>
                    </Card.Actions>

                </Card>
            </ScrollView>

            {/* Floating Action Button */}
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation?.navigate?.('NewItem')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {

        width: '100%',
        height: 1000,
    },
    content: {
        padding: 16,
        paddingBottom: 80,
    },
    greeting: {
        marginBottom: 4,
    },
    subtext: {
        marginBottom: 16,
        opacity: 0.7,
    },
    card: {
        marginBottom: 16,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
});
