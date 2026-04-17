module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Reanimated 4 uses the worklets plugin (must be LAST)
      'react-native-worklets/plugin',
    ],
  };
};
