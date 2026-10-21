const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// drizzle 마이그레이션(.sql)을 문자열로 import 한다. 변환은 metro.sql-transformer.js.
config.resolver.sourceExts.push("sql");
config.transformer.babelTransformerPath = require.resolve("./metro.sql-transformer");

module.exports = config;
