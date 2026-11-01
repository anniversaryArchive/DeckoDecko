import { describe, expect, it, vi } from "vitest";

import { createSupabaseClient } from "../supabase";
import { dailyOnce, viewLogDay } from "./viewLog";
import { createMemoryViewLogRepository } from "./viewLog.memory";
import { createSupabaseViewLogRepository } from "./viewLog.supabase";

const DEVICE = "8c2f3a1e-4b5d-4e6f-8a9b-0c1d2e3f4a5b";

describe("viewLogDay", () => {
  it("서울 날짜를 쓴다 (UTC 15시부터 다음 날)", () => {
    expect(viewLogDay(new Date("2026-10-29T14:59:59Z"))).toBe("2026-10-29");
    expect(viewLogDay(new Date("2026-10-29T15:00:00Z"))).toBe("2026-10-30");
  });
});

describe("dailyOnce", () => {
  function setup(day = { value: "2026-10-29" }) {
    const send = vi.fn(async (_gachaId: string) => {});
    return { send, day, log: dailyOnce(send, () => day.value) };
  }

  it("같은 날 같은 가챠는 한 번만 보내고, 다른 가챠는 따로 보낸다", async () => {
    const { send, log } = setup();
    await log("1");
    await log("1");
    await log("2");
    expect(send.mock.calls).toEqual([["1"], ["2"]]);
  });

  it("보내는 중에 다시 부르면 같은 요청을 기다린다 (빠른 재진입)", async () => {
    const { send, log } = setup();
    await Promise.all([log("1"), log("1")]);
    expect(send).toHaveBeenCalledOnce();
  });

  it("날짜가 바뀌면 다시 보낸다", async () => {
    const { send, day, log } = setup();
    await log("1");
    day.value = "2026-10-30";
    await log("1");
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("실패하면 던지고, 다음 호출에서 다시 보낸다", async () => {
    const { send, log } = setup();
    send.mockRejectedValueOnce(new Error("offline"));
    await expect(log("1")).rejects.toThrow("offline");
    await log("1");
    await log("1");
    expect(send).toHaveBeenCalledTimes(2);
  });
});

describe("createMemoryViewLogRepository", () => {
  it("보낸 로그를 날짜와 함께 쌓고, 같은 날 같은 가챠는 한 번만 남긴다", async () => {
    const repo = createMemoryViewLogRepository(() => "2026-10-29");
    await repo.logGachaView("1");
    await repo.logGachaView("1");
    expect(repo.logged()).toEqual([{ gachaId: "1", day: "2026-10-29" }]);
  });
});

// fetch 를 바꿔 끼워 요청만 본다 (실제 Supabase 에 붙지 않는다)
function fakeRepository(status = 204, getDeviceId = async () => DEVICE) {
  const requests: { url: URL; body: unknown }[] = [];
  const fakeFetch: typeof fetch = async (input, init) => {
    requests.push({
      url: new URL(input instanceof Request ? input.url : String(input)),
      body: JSON.parse(String(init?.body)),
    });
    return status === 204
      ? new Response(null, { status })
      : Response.json({ message: "boom", code: "P0001" }, { status });
  };
  const client = createSupabaseClient("http://localhost:54321", "sb_publishable_test", {
    fetch: fakeFetch,
  });
  return { repo: createSupabaseViewLogRepository(client, getDeviceId), requests };
}

describe("createSupabaseViewLogRepository", () => {
  it("log_gacha_view RPC 를 숫자 id 와 기기 UUID 로 부른다", async () => {
    const { repo, requests } = fakeRepository();
    await repo.logGachaView("42");
    expect(requests).toHaveLength(1);
    expect(requests[0]!.url.pathname).toBe("/rest/v1/rpc/log_gacha_view");
    expect(requests[0]!.body).toEqual({ p_gacha_id: 42, p_device_id: DEVICE });
  });

  it("같은 가챠를 다시 열어도 그날은 다시 요청하지 않는다", async () => {
    const { repo, requests } = fakeRepository();
    await repo.logGachaView("42");
    await repo.logGachaView("42");
    expect(requests).toHaveLength(1);
  });

  it("숫자가 아닌 id 는 요청하지 않는다", async () => {
    const { repo, requests } = fakeRepository();
    await repo.logGachaView("abc");
    expect(requests).toHaveLength(0);
  });

  it("서버 에러는 던진다", async () => {
    const { repo } = fakeRepository(400);
    await expect(repo.logGachaView("42")).rejects.toThrow("[viewLog.logGachaView] boom");
  });

  it("기기 UUID 를 못 읽으면 요청하지 않고 던진다", async () => {
    const { repo, requests } = fakeRepository(204, async () => {
      throw new Error("storage");
    });
    await expect(repo.logGachaView("42")).rejects.toThrow("storage");
    expect(requests).toHaveLength(0);
  });
});
