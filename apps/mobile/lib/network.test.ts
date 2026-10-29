import { beforeEach, describe, expect, it, vi } from "vitest";

import { isOnline, recheckNetworkState, watchNetworkState } from "./network";

type State = { isConnected?: boolean; isInternetReachable?: boolean | null };

// expo-network 를 손으로 움직인다: 이벤트를 보내고, getNetworkStateAsync 의 응답 시점을 정한다
const expo = vi.hoisted(() => ({
  listener: undefined as ((state: State) => void) | undefined,
  pending: [] as ((state: State) => void)[],
  removed: 0,
}));
vi.mock("expo-network", () => ({
  addNetworkStateListener: (listener: (state: State) => void) => {
    expo.listener = listener;
    return { remove: () => expo.removed++ };
  },
  getNetworkStateAsync: () => new Promise<State>((resolve) => expo.pending.push(resolve)),
}));

// 앱 상태 변화를 손으로 보낸다
const rn = vi.hoisted(() => ({
  listener: undefined as ((state: string) => void) | undefined,
  removed: 0,
}));
vi.mock("react-native", () => ({
  AppState: {
    addEventListener: (_type: "change", listener: (state: string) => void) => {
      rn.listener = listener;
      return { remove: () => rn.removed++ };
    },
  },
}));

// setOnlineListener 에 넘긴 setup 을 잡아 두고, setOnline 호출을 기록한다
const core = vi.hoisted(() => ({
  setup: undefined as
    ((setOnline: (online: boolean) => void) => (() => void) | undefined) | undefined,
}));
vi.mock("@deckodecko/core/react", () => ({
  setOnlineListener: (setup: NonNullable<typeof core.setup>) => {
    core.setup = setup;
  },
}));

const OFFLINE = { isConnected: false, isInternetReachable: false };
const ONLINE = { isConnected: true, isInternetReachable: true };

function start() {
  watchNetworkState();
  const setOnline = vi.fn<(online: boolean) => void>();
  const cleanup = core.setup!(setOnline);
  return { setOnline, cleanup: cleanup! };
}

// then 체인이 돌 때까지 기다린다
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  expo.listener = undefined;
  expo.pending = [];
  expo.removed = 0;
  rn.listener = undefined;
  rn.removed = 0;
});

describe("isOnline", () => {
  it.each([
    [{ isConnected: true, isInternetReachable: true }, true],
    [{ isConnected: false, isInternetReachable: false }, false],
    [{ isConnected: true, isInternetReachable: false }, false],
    [{ isConnected: false, isInternetReachable: undefined }, false],
    [{ isConnected: undefined, isInternetReachable: undefined }, true],
  ])("%o → %s", (state, expected) => {
    expect(isOnline(state)).toBe(expected);
  });
});

describe("watchNetworkState", () => {
  it("첫 값은 직접 물어서 알린다", async () => {
    const { setOnline } = start();
    expo.pending.shift()!(OFFLINE);
    await flush();
    expect(setOnline).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("첫 응답보다 이벤트가 먼저 오면 늦게 온 첫 응답은 버린다", async () => {
    const { setOnline } = start();
    expo.listener!(OFFLINE);
    expo.pending.shift()!(ONLINE);
    await flush();
    expect(setOnline.mock.calls).toEqual([[false]]);
  });

  it("정리한 뒤에 온 첫 응답은 버리고 리스너를 뗀다", async () => {
    const { setOnline, cleanup } = start();
    cleanup();
    expo.pending.shift()!(OFFLINE);
    await flush();
    expect(setOnline).not.toHaveBeenCalled();
    expect(expo.removed).toBe(1);
    expect(rn.removed).toBe(1);
  });
});

describe("앱이 다시 열릴 때", () => {
  it("연결 상태를 다시 물어 놓친 변경을 맞춘다", async () => {
    const { setOnline } = start();
    expo.listener!(OFFLINE);
    rn.listener!("background");
    expect(expo.pending).toHaveLength(1);
    rn.listener!("active");
    expo.pending.pop()!(ONLINE);
    await flush();
    expect(setOnline.mock.calls).toEqual([[false], [true]]);
  });
});

describe("recheckNetworkState", () => {
  it("기기에 다시 물어 지금 리스너로 알린다", async () => {
    const { setOnline } = start();
    expo.listener!(OFFLINE);
    recheckNetworkState();
    expo.pending.pop()!(ONLINE);
    await flush();
    expect(setOnline.mock.calls).toEqual([[false], [true]]);
  });

  it("리스너를 정리한 뒤에는 알리지 않는다", async () => {
    const { setOnline, cleanup } = start();
    cleanup();
    recheckNetworkState();
    expo.pending.pop()!(ONLINE);
    await flush();
    expect(setOnline).not.toHaveBeenCalled();
  });
});
