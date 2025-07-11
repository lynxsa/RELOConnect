module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js', 
    '<rootDir>/__tests__/setup.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|react-navigation|@react-navigation|@testing-library/react-native|expo-linear-gradient|@expo/vector-icons|@stripe|socket.io-client)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/backend/',
    '/build/',
    '/dist/',
  ],
};
