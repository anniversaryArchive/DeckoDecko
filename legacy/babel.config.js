module.exports = function (api) {
  api.cache(true);
  return {
     presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ['react-native-reanimated/plugin'], // 가장 마지막에 위치
  };
};
