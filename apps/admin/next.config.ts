import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 모노레포 루트를 추적 범위로 잡아 standalone 빌드 시 workspace 패키지를 포함한다.
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
};

export default nextConfig;
