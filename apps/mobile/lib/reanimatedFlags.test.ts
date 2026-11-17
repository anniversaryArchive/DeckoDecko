import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

const appPackage = JSON.parse(
  readFileSync(join(import.meta.dirname, "../package.json"), "utf8")
) as {
  expo?: { autolinking?: { ios?: { buildFromSource?: string[] } } };
  reanimated?: { staticFeatureFlags?: Record<string, boolean> };
};
const reanimatedVersion = (
  JSON.parse(readFileSync(require.resolve("react-native-reanimated/package.json"), "utf8")) as {
    version: string;
  }
).version;

/** 4.6.0 에서 고쳐진 버그(software-mansion/react-native-reanimated#10805)를 피하려고 끈 플래그 */
const FLAG = "FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS";
const REANIMATED = "react-native-reanimated";

function isBefore4_6(version: string): boolean {
  const [major = 0, minor = 0] = version.split(".").map(Number);
  return major < 4 || (major === 4 && minor < 6);
}

const before4_6 = isBefore4_6(reanimatedVersion);
const flag = appPackage.reanimated?.staticFeatureFlags?.[FLAG];
const buildFromSource = appPackage.expo?.autolinking?.ios?.buildFromSource ?? [];

// 플래그가 켜져 있으면 JS 스레드가 1초 넘게 막힌 사이 끝난 색 전환이 다음 렌더에서 처음 색으로 돌아간다 (#258)
describe("Reanimated static feature flags", () => {
  it.skipIf(!before4_6)(`Reanimated 4.6 미만에서는 ${FLAG} 를 끈다`, () => {
    expect(flag, `package.json 의 reanimated.staticFeatureFlags.${FLAG}`).toBe(false);
  });

  // iOS 미리 빌드 모듈(EXPO_USE_PRECOMPILED_MODULES)은 플래그를 기본값으로 굳혀 컴파일해서 package.json 플래그가 무시된다
  it.skipIf(!before4_6)("Reanimated 4.6 미만에서는 iOS 에서 Reanimated 를 소스로 빌드한다", () => {
    expect(buildFromSource, "package.json 의 expo.autolinking.ios.buildFromSource").toContain(
      REANIMATED
    );
  });

  it.skipIf(before4_6)("Reanimated 4.6 이상으로 올리면 이 우회를 지운다", () => {
    const message = `react-native-reanimated ${reanimatedVersion}: package.json 의 reanimated.staticFeatureFlags.${FLAG} · expo.autolinking.ios.buildFromSource 의 ${REANIMATED} 와 이 테스트를 지운다`;
    expect(flag, message).toBeUndefined();
    expect(buildFromSource, message).not.toContain(REANIMATED);
  });
});
