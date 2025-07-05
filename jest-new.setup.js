import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'RELOConnect',
      slug: 'reloconnect',
    },
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: ({ children }) => children,
  Tabs: ({ children }) => children,
  Drawer: ({ children }) => children,
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Vector Icons
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Icon',
  Ionicons: 'Icon',
  MaterialIcons: 'Icon',
}));

// Global test setup
global.__DEV__ = true;
