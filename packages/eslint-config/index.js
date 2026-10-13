import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** 모든 패키지가 공통으로 무시하는 경로. */
export const ignores = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.turbo/**",
  "**/coverage/**",
];

/** 프레임워크 설정(expo, next) 위에 얹는 공통 규칙. */
export const rules = {
  // import type 을 강제해 번들러가 타입 import 를 확실히 제거하게 한다.
  "@typescript-eslint/consistent-type-imports": [
    "error",
    { prefer: "type-imports", fixStyle: "inline-type-imports" },
  ],
  "@typescript-eslint/no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],
};

/** 프레임워크 없는 TS 패키지(packages/*) 용 전체 설정. */
export const base = tseslint.config(
  { ignores },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { rules }
);
