const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Point to the current directory for Metro
config.projectRoot = __dirname;

// Exclude backend directory and compiled files from Metro bundling
config.resolver.blockList = [
  /backend\/.*/,
  /admin-dashboard\/.*/,
  /.*\/dist\/.*/,
  /.*\/node_modules\/.*\/node_modules\/.*/,
];

// Ensure proper platform resolution for web
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Add node_modules resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

module.exports = config;
