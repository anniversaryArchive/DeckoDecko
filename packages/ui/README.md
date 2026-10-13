# @deckodecko/ui

디자인 토큰과 공용 컴포넌트. 지금은 토큰(`src/tokens.ts`)만 있다.

```ts
import { colors, radius } from "@deckodecko/ui";
```

빌드 단계 없이 TS 소스를 그대로 내보낸다. Next.js 쪽은 `transpilePackages` 에 이 패키지를 적어 둔다.
