# @deckodecko/core

앱과 백오피스가 같이 쓰는 데이터 계층. 화면은 Supabase 를 직접 부르지 않고 **훅 → repository → Supabase** 순서로만 간다.

```ts
// 화면 (클라이언트 컴포넌트)
import { useGachaList, useGachaSearch } from "@deckodecko/core/react";

// 루트 레이아웃
import { CoreProvider } from "@deckodecko/core/react";
<CoreProvider repositories={repositories}>…</CoreProvider>

// 저장소 만들기 (앱: apps/mobile/lib/repositories.ts)
import { createMemoryGachaRepository, type Repositories } from "@deckodecko/core";
```

| 경로                    | 내용                                                                               | React |
| ----------------------- | ---------------------------------------------------------------------------------- | ----- |
| `src/supabase.ts`       | `createSupabaseClient(url, anonKey)`. 환경변수는 호출하는 쪽이 넘김                | 없음  |
| `src/database.types.ts` | Supabase 생성 타입. `pnpm --filter @deckodecko/core gen:types` 로 갱신             | 없음  |
| `src/types.ts`          | 도메인 타입 (`Gacha`, `GachaDetail`, `GachaItem`, `Media`)                         | 없음  |
| `src/repositories/`     | `GachaRepository` 인터페이스와 구현 (`memory`, 2주차에 `supabase`)                 | 없음  |
| `src/queryKeys.ts`      | React Query 키 규칙                                                                | 없음  |
| `src/react/`            | `CoreProvider`, `useGachaList` · `usePopularGacha` · `useGacha` · `useGachaSearch` | 있음  |

엔트리가 둘인 이유: `@deckodecko/core` 는 React 가 없어 Next.js 서버 컴포넌트 · 스크립트에서 import 해도 되고, `@deckodecko/core/react` 는 클라이언트 전용이다.

## Supabase 연결 (2주차)

스키마(#114)가 들어오면 `src/supabase.ts`(anon key 클라이언트 팩토리), `src/database.types.ts`(생성 타입, `supabase gen types typescript`), `src/repositories/gacha.supabase.ts` 를 같이 넣는다. 환경변수는 이 패키지가 읽지 않고 앱 · 백오피스가 넘긴다. service role 키는 어디서도 이 패키지에 넣지 않는다.

## 새 도메인 추가

1. `src/types.ts` 에 도메인 타입
2. `src/repositories/<도메인>.ts` 에 인터페이스, `<도메인>.memory.ts` · `<도메인>.supabase.ts` 에 구현, `repositories/index.ts` 의 `Repositories` 에 키 추가
3. `src/queryKeys.ts` 에 키, `src/react/hooks.ts` 에 훅
