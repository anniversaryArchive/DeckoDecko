import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

const appPackage = JSON.parse(
  readFileSync(join(import.meta.dirname, "../package.json"), "utf8")
) as { reanimated?: { staticFeatureFlags?: Record<string, boolean> } };
const reanimatedVersion = (
  JSON.parse(readFileSync(require.resolve("react-native-reanimated/package.json"), "utf8")) as {
    version: string;
  }
).version;

/** 4.6.0 에서 고쳐진 버그(software-mansion/react-native-reanimated#10805)를 피하려고 끈 플래그 */
const FLAG = "FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS";

function isBefore4_6(version: string): boolean {
  const [major = 0, minor = 0] = version.split(".").map(Number);
  return major < 4 || (major === 4 && minor < 6);
}

// 플래그가 켜져 있으면 JS 스레드가 1초 넘게 막힌 사이 끝난 색 전환이 다음 렌더에서 처음 색으로 돌아간다 (#258)
describe("Reanimated static feature flags", () => {
  it(`Reanimated 4.6 미만에서는 ${FLAG} 를 끈다`, () => {
    if (!isBefore4_6(reanimatedVersion)) return;
    expect(appPackage.reanimated?.staticFeatureFlags?.[FLAG]).toBe(false);
  });

  it("Reanimated 4.6 이상으로 올리면 이 우회를 지운다", () => {
    if (isBefore4_6(reanimatedVersion)) return;
    expect(
      appPackage.reanimated?.staticFeatureFlags?.[FLAG],
      `react-native-reanimated ${reanimatedVersion}: package.json 의 reanimated.${FLAG} 와 이 테스트를 지운다`
    ).toBeUndefined();
  });
});
