import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { ignores, rules } from "@deckodecko/eslint-config";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([...ignores, ".next/**", "out/**", "next-env.d.ts"]),
  { rules },
]);
