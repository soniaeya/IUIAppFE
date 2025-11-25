// src/GlobalStyles.js
import {StyleSheet, TouchableOpacity} from 'react-native';
import { theme } from './theme';

export const gs = StyleSheet.create({

    weatherBar: {
        position: "absolute",
        top: 70,           // just under your search bar (which is at top: 15)
        left: 10,
        right: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        zIndex: 2,
        elevation: 6,
    },
    weatherBarText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },


    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },

    modalBox: {
        width: "80%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
    },

    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },

    modalText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },

    modalButton: {
        backgroundColor: "#6f4b63",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },

    screen: {
        flex: 1,
        backgroundColor: "white",
        padding: theme.spacing.lg,
    },
    card: {
        backgroundColor: "#dbbdab",
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.palette.border,
    },

    TouchableOpacity:{  backgroundColor: "white", borderColor: "#a8809b"},
    view: { flexDirection: 'row', justifyContent: 'space-between' },

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
