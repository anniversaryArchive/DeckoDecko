import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SUPABASE_ENV = {
  EXPO_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};

// repositories.ts 는 import 할 때 환경변수를 읽어 저장소를 만든다. 경우마다 모듈을 새로 불러온다.
async function loadRepositories(env: Record<string, string>, dev = true) {
  vi.resetModules();
  vi.stubGlobal("__DEV__", dev);
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return (await import("./repositories")).repositories;
}

describe("앱 저장소 묶음", () => {
  const fetchMock = vi.fn<typeof fetch>(async () => Response.json([]));

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** 가챠 목록을 한 번 불러 Supabase 로 요청이 갔는지 본다 */
  async function usesSupabase(repositories: Awaited<ReturnType<typeof loadRepositories>>) {
    const list = await repositories.gacha.listGacha();
    const url = fetchMock.mock.calls[0]?.[0];
    if (!url) {
      expect(list.length).toBeGreaterThan(0); // 목 데이터
      return false;
    }
    expect(String(url)).toContain("localhost:54321/rest/v1/gacha");
    return true;
  }

  it.each([
    ["Supabase 모드", { EXPO_PUBLIC_DATA_SOURCE: "", ...SUPABASE_ENV }, true],
    ["목 모드", { EXPO_PUBLIC_DATA_SOURCE: "mock", ...SUPABASE_ENV }, false],
  ])("%s: 가챠는 해당 구현, WISH / GET 기록은 로컬에 저장한다", async (_mode, env, supabase) => {
    const repositories = await loadRepositories(env);

    expect(await usesSupabase(repositories)).toBe(supabase);
    expect(repositories.folders).toBeDefined();
    if (!repositories.items) throw new Error("items 저장소가 없다");
    const created = await repositories.items.createItem({
      gachaId: "1",
      type: "WISH",
      name: "테스트",
    });
    expect(await repositories.items.getItem(created.id)).toMatchObject({
      gachaId: "1",
      type: "WISH",
    });
  });

  it("개발 빌드에서 Supabase 값이 없으면 목 데이터로 돈다", async () => {
    const repositories = await loadRepositories({ EXPO_PUBLIC_DATA_SOURCE: "" });

    expect(await usesSupabase(repositories)).toBe(false);
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it("출시 빌드는 mock 을 무시하고 Supabase 를 쓴다", async () => {
    const repositories = await loadRepositories(
      { EXPO_PUBLIC_DATA_SOURCE: "mock", ...SUPABASE_ENV },
      false
    );

    expect(await usesSupabase(repositories)).toBe(true);
  });

  it("출시 빌드에서 Supabase 값이 없으면 시작할 때 실패한다", async () => {
    await expect(loadRepositories({ EXPO_PUBLIC_DATA_SOURCE: "" }, false)).rejects.toThrow(
      "EXPO_PUBLIC_SUPABASE_URL"
    );
  });
});
