// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const { ignores, sharedRules, prettier } = require("@deckodecko/eslint-config");

module.exports = defineConfig([
  expoConfig,
  { ignores: [...ignores, ".expo/**"] },
  sharedRules,
  prettier,
]);
