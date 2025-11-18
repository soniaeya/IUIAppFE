// src/GlobalStyles.js
import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const gs = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#dbbdab",
        padding: theme.spacing.lg,
    },
    card: {
        backgroundColor: "#dbbdab",
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.palette.border,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    center: { justifyContent: 'center', alignItems: 'center' },

    // text variants
    h1: { ...theme.typography.h1, color: theme.palette.text },
    h2: { ...theme.typography.h2, color: theme.palette.text },
    body: { ...theme.typography.body, color: theme.palette.text },
    muted: { ...theme.typography.body, color: theme.palette.muted },

    // common spacing helpers
    mt: { marginTop: theme.spacing.md },
    mb: { marginBottom: theme.spacing.md },
    pt: { paddingTop: theme.spacing.md },
    pb: { paddingBottom: theme.spacing.md },
});
