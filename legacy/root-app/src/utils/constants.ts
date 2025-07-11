// API Constants
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// App Constants
export const APP_NAME = 'RELOConnect';
export const APP_VERSION = '1.0.0';

// Theme Constants
export const PRIMARY_COLOR = '#0057FF';
export const SECONDARY_COLOR = '#00B2FF';
export const GRADIENT_COLORS = ['#0057FF', '#00B2FF'];

// Pricing Constants
export const DEFAULT_CURRENCY = 'ZAR';
export const INSURANCE_PERCENTAGE = 5; // 5% insurance rate

// Map Constants
export const DEFAULT_MAP_ZOOM = 14;
export const DEFAULT_LOCATION = {
  latitude: -26.2041,  // Johannesburg
  longitude: 28.0473,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// UI Constants
export const BUTTON_HEIGHT = 48;
export const INPUT_HEIGHT = 48;
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
export const FONT_SIZES = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 12,
};
