/**
 * Culaccino color palette — synced from the sibling web artifact's index.css.
 * Converted from HSL to hex.
 *
 * --background: 43 33% 98%   → #FAF8F5
 * --foreground: 22 32% 13%   → #2C1E16
 * --primary:    24 67% 53%   → #D87736
 * --secondary:  42 33% 93%   → #EDE8DF
 * --muted:      42 33% 93%   → #EDE8DF
 * --border:     42 21% 87%   → #DAD5CB
 * --card:        0  0% 100%  → #FFFFFF
 * --destructive: 0 51% 46%   → #AF3030
 * --radius: 0.5rem → 8px
 */

const colors = {
  light: {
    // Legacy alias (kept for scaffold compatibility)
    text: '#2C1E16',
    tint: '#D87736',

    // Surfaces
    background: '#FAF8F5',
    foreground: '#2C1E16',

    // Cards
    card: '#FFFFFF',
    cardForeground: '#2C1E16',

    // Primary (warm amber — the Culaccino brand color)
    primary: '#D87736',
    primaryForeground: '#FFFFFF',

    // Secondary
    secondary: '#EDE8DF',
    secondaryForeground: '#3A2719',

    // Muted
    muted: '#EDE8DF',
    mutedForeground: '#787068',

    // Accent (same as primary for this brand)
    accent: '#D87736',
    accentForeground: '#FFFFFF',

    // Destructive
    destructive: '#AF3030',
    destructiveForeground: '#FFFFFF',

    // Borders / inputs
    border: '#DAD5CB',
    input: '#DAD5CB',

    // Status colors
    lowStock: '#AF3030',
    lowStockSurface: '#FEF2F2',
    success: '#3A7D4A',
    successSurface: '#F0FDF4',
  },

  // 8 px — matches web --radius: 0.5rem
  radius: 8,
};

export default colors;
