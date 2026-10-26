import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// repositories.ts 는 import 할 때 환경변수를 읽어 저장소를 만든다. 모드마다 모듈을 새로 불러온다.
async function loadRepositories(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return (await import("./repositories")).repositories;
}

describe("앱 저장소 묶음", () => {
  beforeEach(() => {
    vi.stubGlobal("__DEV__", true);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each([
    [
      "Supabase 모드",
      {
        EXPO_PUBLIC_DATA_SOURCE: "",
        EXPO_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      },
    ],
    ["목 모드", { EXPO_PUBLIC_DATA_SOURCE: "mock" }],
  ])("%s: WISH / GET 기록을 저장한다", async (_mode, env) => {
    const repositories = await loadRepositories(env);
    const items = repositories.items;
    const folders = repositories.folders;
    expect(folders).toBeDefined();
    if (!items) throw new Error("items 저장소가 없다");

    const created = await items.createItem({ gachaId: "1", type: "WISH", name: "테스트" });

    expect(await items.getItem(created.id)).toMatchObject({ gachaId: "1", type: "WISH" });
  });
});
