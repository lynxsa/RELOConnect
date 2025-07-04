const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude backend directory and compiled files from Metro bundling
config.resolver.blockList = [
  /backend\/.*/,
  /admin-dashboard\/.*/,
  /.*\/dist\/.*/,
];

// Ensure proper platform resolution for web
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

module.exports = config;
