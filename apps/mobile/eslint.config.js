// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const { ignores, sharedRules, prettier } = require("@deckodecko/eslint-config");

module.exports = defineConfig([
  expoConfig,
  { ignores: [...ignores, ".expo/**"] },
  sharedRules,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // iOS 에서 한글 조합이 끊기는 문제가 다시 생기지 않게 입력창은 ComposingTextInput 으로만 그린다
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["TextInput"],
              message: "@deckodecko/ui/native 의 Input 이나 ComposingTextInput 을 쓴다.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  prettier,
]);
