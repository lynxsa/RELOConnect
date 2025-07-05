import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  useFonts: jest.fn(() => [true, null]),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
  setOptions: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'RELOConnect',
      slug: 'reloconnect',
    },
    manifest: {},
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Slot: 'Slot',
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs',
  ErrorBoundary: 'ErrorBoundary',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Feather: 'Feather',
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  })),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  })),
  CardStyleInterpolators: {},
  TransitionSpecs: {},
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  })),
}));

// Mock React Native modules
jest.mock('react-native-reanimated', () => ({
  default: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
  },
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(() => ({})),
  useAnimatedGestureHandler: jest.fn(),
  runOnJS: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: 'MapView',
  Marker: 'Marker',
  Callout: 'Callout',
  Circle: 'Circle',
  Polyline: 'Polyline',
  Polygon: 'Polygon',
}));

// Mock React Native core modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Global test environment setup
global.console = {
  ...console,
  // Uncomment to ignore specific console outputs in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
