import { defineConfig } from "drizzle-kit";

// 로컬 DB(expo-sqlite) 마이그레이션 생성 설정. `pnpm --filter @deckodecko/mobile db:generate`
export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
});
