# 0002. 모노레포 구조와 패키지 경계

- 날짜: 2026-10-16
- 관련: #104, #109, #120

## 상황

앱(Expo)과 백오피스(Next.js)가 도메인 타입과 데이터 접근을 같이 쓴다.
레거시는 화면이 Supabase 를 직접 불렀고, SQLite 서비스마다 DB 연결을 따로 열었다.
세 명이 비동기로 일하므로 "이 코드는 어디에 두나"를 매번 묻지 않도록 경계를 먼저 정한다.

## 선택지

**데이터 접근을 어디에 두나**

| 선택지                                | 장점                                                   | 단점                                                           |
| ------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| 앱 · 백오피스가 각자 Supabase 호출    | 패키지가 하나 줄어든다                                 | 쿼리 · 타입이 두 벌이 된다. 레거시의 쿼리 불일치 버그가 그대로 |
| `packages/core` 에 저장소 + 훅 (채택) | 타입 · 쿼리 키 · 저장소가 한 곳. 목 저장소로 바꿔 끼움 | 엔트리를 React 유무로 나눠야 한다                              |

**로컬 DB(drizzle + expo-sqlite)를 어디에 두나**

| 선택지                                  | 장점                                                      | 단점                                                                        |
| --------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/mobile` 에 전부 (채택)            | 네이티브 의존성 · Metro/Babel 설정 · 마이그레이션이 한 곳 | 저장소 구현이 core 밖에 생긴다                                              |
| 스키마는 core, 연결 · 마이그레이션은 앱 | 2주차 저장소 구현도 core 에 둘 수 있다                    | core 에 drizzle 이 들어와 백오피스도 설치한다. drizzle 버전을 손으로 맞춘다 |

## 결정

| 경로                     | 맡는 것                                                        | 의존해도 되는 것  |
| ------------------------ | -------------------------------------------------------------- | ----------------- |
| `apps/mobile`            | 화면 · 라우팅, 로컬 DB(`lib/db`, `drizzle/`), 저장소 조립      | core, ui          |
| `apps/admin`             | 운영 화면. 쓰기(service role)는 서버 쪽 모듈에서만             | core, ui          |
| `packages/core`          | 도메인 타입, 저장소 인터페이스 · 구현, 쿼리 키, React Query 훅 | React(./react 만) |
| `packages/ui`            | 디자인 토큰 · 테마 · 공용 컴포넌트                             | React             |
| `packages/eslint-config` | 공통 린트 규칙                                                 | –                 |
| `supabase/`              | 원격 스키마 · RLS · RPC · seed (마이그레이션 파일로만)         | –                 |
| `legacy/`                | 참고용. 워크스페이스 밖, import 금지                           | –                 |

- core 엔트리는 셋: `@deckodecko/core`(React 없음, 서버 컴포넌트 · 스크립트에서도 import), `@deckodecko/core/react`(Provider · 훅, 클라이언트 전용), `@deckodecko/core/mocks`(목 데이터).
- 화면은 훅만 쓴다. 저장소는 앱 · 백오피스의 `lib/repositories.ts` 에서 조립해 `CoreProvider` 로 넘긴다. React 가 없는 곳만 저장소 함수를 직접 await 한다.
- 로컬 DB 는 `apps/mobile` 에 둔다. 2주차에 items · folders 저장소 인터페이스와 도메인 타입은 core 에, drizzle 구현은 앱에 두고 `lib/repositories.ts` 에서 주입한다.
- 패키지는 빌드 단계 없이 TS 소스를 그대로 내보낸다. Next.js 는 `transpilePackages` 에 적는다.

**환경변수 이름**

| 이름                            | 쓰는 곳                   | 공개 여부                      |
| ------------------------------- | ------------------------- | ------------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`      | `apps/mobile`             | 공개 (앱 번들에 들어감)        |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `apps/mobile`             | 공개                           |
| `NEXT_PUBLIC_SUPABASE_URL`      | `apps/admin`              | 공개 (브라우저 번들에 들어감)  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `apps/admin`              | 공개                           |
| `SUPABASE_SERVICE_ROLE_KEY`     | `apps/admin` 서버 쪽 모듈 | 비공개. 접두사를 붙이지 않는다 |

- 클라이언트에서 읽는 값은 프레임워크 접두사(`EXPO_PUBLIC_` · `NEXT_PUBLIC_`)를 붙이고, 그 뒤는 `<서비스>_<항목>` 으로 쓴다. 같은 값이면 앱과 백오피스에서 접두사만 다르다.
- 접두사가 붙은 값은 빌드 때 번들에 그대로 박힌다. 비밀 값에는 절대 붙이지 않는다.
- 환경변수는 앱(`apps/*`)에서만 읽는다. core 는 `process.env` 를 읽지 않고, 앱이 `lib/repositories.ts` 에서 클라이언트를 만들어 넘긴다.
- 값은 각 앱 폴더의 `.env.local` 에 둔다 (git 제외). 키 목록은 같은 폴더의 `.env.example` 에 빈 값으로 커밋한다. 루트 `.env` 는 쓰지 않는다.

## 이유

- 백오피스는 사용자 기기의 SQLite 를 읽을 수 없다. 로컬 DB 를 core 에 두어도 공유할 코드가 없고, 의존성만 백오피스에 따라간다.
- 공유가 필요한 것은 도메인 타입뿐이다. 이것은 어느 쪽이든 core 의 `types.ts` 에 둔다. DB 컬럼을 그대로 노출하지 않는다는 원칙과도 맞다.
- 저장소 인터페이스를 core 에 두고 구현을 주입하면, 목 → Supabase · drizzle 로 바꿔도 화면 코드는 그대로다.
- React 없는 엔트리를 따로 두어야 Next.js 서버 컴포넌트에서 core 를 import 해도 클라이언트 코드가 섞이지 않는다.
- 환경변수를 앱에서만 읽으면 core 가 Expo · Next 중 어느 쪽 접두사도 몰라도 된다. 번들러가 `process.env.EXPO_PUBLIC_*` 를 바꿔 넣는 범위를 신경 쓸 필요도 없다.

## 알아 둘 것

- `.npmrc` 의 `node-linker=hoisted` 는 Metro 가 심볼릭 링크 node_modules 에서 모듈을 못 찾는 문제 때문이다. 바꾸지 않는다.
- 계정 · 동기화가 생겨 로컬 기록을 서버와 맞춰야 하면, 로컬 DB 를 core 로 옮길지 이 ADR 을 다시 본다.
- turbo 는 strict 모드라 `turbo.json` 에 적지 않은 환경변수를 태스크에 넘기지 않는다. `EXPO_PUBLIC_*` · `NEXT_PUBLIC_*` 는 turbo 가 알아서 잡지만, `SUPABASE_SERVICE_ROLE_KEY` 처럼 접두사 없는 값을 빌드에서 쓰게 되면 `turbo.json` 의 `env` 에 적는다. `.env*` 파일 변경도 캐시에 반영되도록 첫 환경변수를 넣는 PR 에서 `inputs` 에 추가한다.
- 레거시는 `EXPO_PUBLIC_SUPABASE_KEY` 였다. 어떤 키인지 드러나도록 `_ANON_KEY` 로 바꾼다.
