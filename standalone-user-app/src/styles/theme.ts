// Color System
export const Colors = {
  // Primary Brand Colors
  primary: '#0057FF',
  primaryLight: '#00B2FF',
  primaryDark: '#0041CC',
  
  // Secondary Colors
  secondary: '#64748b',
  secondaryLight: '#94a3b8',
  secondaryDark: '#475569',
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Background Colors
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#f1f5f9',
  
  // Border Colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
  
  // Text Colors
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

// Typography System
export const Typography = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
  },
};

// Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

// Border Radius System
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadow System
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

// Layout System
export const Layout = {
  // Screen Padding
  screenPadding: 16,
  
  // Component Heights
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  inputHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // Common Dimensions
  tabBarHeight: 60,
  headerHeight: 44,
  statusBarHeight: 20,
  
  // Breakpoints (for responsive design)
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};

// Animation System
export const Animation = {
  // Timing Functions
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Easing Functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  
  // Common Animation Values
  opacity: {
    invisible: 0,
    visible: 1,
  },
  
  scale: {
    normal: 1,
    pressed: 0.95,
    expanded: 1.05,
  },
};

// Grid System
export const Grid = {
  // Container Max Width
  containerMaxWidth: 1200,
  
  // Gutter Sizes
  gutter: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Column Counts
  columns: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
};

// Z-Index System
export const ZIndex = {
  // Base layers
  base: 1,
  above: 10,
  
  // Component layers
  dropdown: 100,
  modal: 1000,
  overlay: 1500,
  toast: 2000,
  
  // System layers
  loading: 9000,
  debug: 9999,
};

// Export all as a single theme object
export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  layout: Layout,
  animation: Animation,
  grid: Grid,
  zIndex: ZIndex,
};
