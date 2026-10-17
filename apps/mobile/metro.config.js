// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// drizzle 마이그레이션(.sql) import
config.resolver.sourceExts.push("sql");

module.exports = config;
