const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  projectRoot: path.resolve(__dirname),
  watchFolders: [
    path.resolve(__dirname, 'node_modules'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
