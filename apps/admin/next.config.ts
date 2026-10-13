import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AI 도구 감지 시 AGENTS.md 를 자동 생성하는 기능 끔 (turbo.json 의 agentGuidance 와 같은 이유)
  agentRules: false,
  // 모노레포 루트를 추적 범위로 잡아 standalone 빌드 시 workspace 패키지를 포함한다.
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
};

export default nextConfig;
