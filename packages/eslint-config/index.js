import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

/** 모든 패키지가 공통으로 무시하는 경로. */
export const ignores = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.turbo/**",
  "**/coverage/**",
];

/**
 * 프레임워크 설정(expo, next) 위에 얹는 공통 규칙.
 * expo·next 설정이 @typescript-eslint 와 import 플러그인을 이미 등록하므로 여기서는 규칙만 적는다.
 */
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
  // import 순서: 외부 → 내부(@/, @deckodecko/) → 상대 경로. 그룹 사이 빈 줄, 그룹 안은 알파벳순.
  "import/order": [
    "error",
    {
      groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
      pathGroups: [
        { pattern: "@deckodecko/**", group: "internal", position: "before" },
        { pattern: "@/**", group: "internal" },
      ],
      pathGroupsExcludedImportTypes: ["builtin"],
      "newlines-between": "always",
      alphabetize: { order: "asc", caseInsensitive: true },
    },
  ],
};

/** 공통 규칙을 TS 파일에만 적용한다 (설정 파일 같은 JS 에는 @typescript-eslint 플러그인이 없다). */
export const sharedRules = { files: ["**/*.{ts,tsx,mts,cts}"], rules };

/** Prettier 가 담당하는 포맷 규칙을 ESLint 에서 끈다. 항상 마지막에 둔다. */
export { prettier };

/** 프레임워크 없는 TS 패키지(packages/*) 용 전체 설정. */
export const base = tseslint.config(
  { ignores },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["**/*.{ts,tsx,mts,cts}"], plugins: { import: importPlugin }, rules },
  prettier
);
