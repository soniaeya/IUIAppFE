// src/theme.js
export const palette = {
    primary: '#2563eb',
    primaryDark: '#1e40af',
    background: '#0b1220',
    surface: '#0f172a',
    text: '#e5e7eb',
    muted: '#94a3b8',
    border: '#1f2937',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
};

export const spacing = {
    xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32,
};

export const radius = {
    sm: 6, md: 10, lg: 14, pill: 999,
};

export const typography = {
    h1: { fontSize: 28, fontWeight: '700' },
    h2: { fontSize: 22, fontWeight: '700' },
    h3: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 12, color: palette.muted },
};

export const theme = { palette, spacing, radius, typography };
