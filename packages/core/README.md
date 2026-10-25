# @deckodecko/core

앱과 백오피스가 같이 쓰는 데이터 계층. 화면은 Supabase 를 직접 부르지 않고 **훅 → repository → Supabase** 순서로만 간다.

```ts
// 화면 (클라이언트 컴포넌트)
import { useGachaList, useGachaSearch } from "@deckodecko/core/react";

// 루트 레이아웃
import { CoreProvider } from "@deckodecko/core/react";
<CoreProvider repositories={repositories}>…</CoreProvider>

// 저장소 만들기 (앱: apps/mobile/lib/repositories.ts, 백오피스: apps/admin/lib/repositories.ts)
import { createMemoryGachaRepository, type Repositories } from "@deckodecko/core";
import { mockCatalog } from "@deckodecko/core/mocks";

// React 없는 곳(서버 컴포넌트 · 스크립트)은 저장소를 직접 await
const list = await repositories.gacha.listGacha();
```

| 경로                    | 내용                                                                                                                 | React |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | ----- |
| `src/supabase.ts`       | `createSupabaseClient(url, publishableKey)`. 환경변수는 호출하는 쪽이 넘김                                           | 없음  |
| `src/database.types.ts` | Supabase 생성 타입. `supabase/README.md` 의 gen types 절차로 갱신                                                    | 없음  |
| `src/types.ts`          | 도메인 타입 (`Gacha`, `GachaDetail`, `GachaItem`, `Media`)                                                           | 없음  |
| `src/repositories/`     | `GachaRepository` 인터페이스와 구현 (`memory` · `supabase`)                                                          | 없음  |
| `src/queryKeys.ts`      | React Query 키 규칙                                                                                                  | 없음  |
| `src/mocks/`            | 개발 · 테스트용 목 카탈로그 (`@deckodecko/core/mocks`). 앱 · 백오피스 · 테스트가 공유                                | 없음  |
| `src/react/`            | `CoreProvider`, 도메인별 훅 `<도메인>.hooks.ts` (`useGachaList` · `usePopularGacha` · `useGacha` · `useGachaSearch`) | 있음  |

엔트리가 둘인 이유: `@deckodecko/core` 는 React 가 없어 Next.js 서버 컴포넌트 · 스크립트에서 import 해도 되고, `@deckodecko/core/react` 는 클라이언트 전용이다.

## Supabase 연결

```ts
import { createSupabaseClient, createSupabaseGachaRepository } from "@deckodecko/core";

const client = createSupabaseClient(url, publishableKey); // publishable key 만
const repositories = { gacha: createSupabaseGachaRepository(client) };
```

- 환경변수는 이 패키지가 읽지 않고 앱 · 백오피스가 넘긴다. secret key(`sb_secret_...`)는 어디서도 이 패키지에 넣지 않는다.
- 행(snake_case) → 도메인 타입 매핑은 `<도메인>.supabase.ts` 안에서만 한다.
- 실패(네트워크 · PostgREST 에러)는 throw 해서 훅의 error 상태로 보낸다. 빈 결과는 빈 배열 · `null` 이다.
- 재시도는 React Query 가 맡는다 (클라이언트의 postgrest 재시도는 껐다).
- 앱은 `EXPO_PUBLIC_DATA_SOURCE=mock` 이면 메모리 저장소를 쓴다 (`apps/mobile/lib/repositories.ts`).

## 새 도메인 추가

1. `src/types.ts` 에 도메인 타입
2. `src/repositories/<도메인>.ts` 에 인터페이스, `<도메인>.memory.ts` · `<도메인>.supabase.ts` 에 구현, `repositories/index.ts` 의 `Repositories` 에 키 추가
3. `src/queryKeys.ts` 에 키, `src/react/<도메인>.hooks.ts` 에 훅을 만들고 `react/index.ts` 에서 export
