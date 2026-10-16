// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// drizzle 마이그레이션(.sql) import, expo-sqlite 웹 번들의 wa-sqlite.wasm
config.resolver.sourceExts.push("sql");
config.resolver.assetExts.push("wasm");

module.exports = config;
