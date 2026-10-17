# AGENTS.md — AI 코딩 도구(Claude Code 등)를 위한 프로젝트 안내

이 파일은 사람이 관리한다. turbo / Next.js 의 자동 생성(`agentGuidance`, `agentRules`)은 꺼 두었다.
팀 규칙이 바뀌면 이 파일을 같이 고친다.

## 이 프로젝트는

가챠 탐색대(DeckoDecko): 애니·게임 가챠 굿즈를 탐색하고 WISH / GET 으로 기록하는 모바일 앱.
2026-10-13 부터 모노레포로 재개발 중. 1.0 출시 11/8, 1.1(AI 사진 등록) 11/22.

- 기획서: https://claude.ai/code/artifact/e668b2ee-acd5-4991-b030-c40a839ce738
- 디자인: https://claude.ai/artifact/X8gVyKo8QVoCMaqj2evY7G

## 구조

| 경로            | 내용                                               |
| --------------- | -------------------------------------------------- |
| `apps/mobile`   | Expo + expo-router 앱                              |
| `apps/admin`    | Next.js 백오피스 (운영자용, 포트 3001)             |
| `packages/ui`   | 디자인 토큰, 공용 컴포넌트                         |
| `packages/core` | Supabase 클라이언트, 생성 타입, 쿼리 훅            |
| `supabase/`     | 마이그레이션 · RLS · RPC · seed                    |
| `legacy/`       | 재개발 전 코드. **참고만, import 금지, 수정 금지** |

`packages/ui` 의 RN 컴포넌트는 `@deckodecko/ui/native` 로만 내보낸다. `apps/admin` 은 이 입구를 import 하지 않는다 (react-native 가 없어 빌드가 깨진다).

아직 없는 폴더는 생기는 대로 채운다. 무엇을 언제 만드는지는 기획서의 투두리스트가 기준이고, 이 파일에는 일정을 적지 않는다.

## 먼저 읽을 것 (버전 차이 주의)

설치된 버전이 학습 데이터보다 최신일 수 있다. 설정이나 API 를 건드리기 전에 설치된 패키지에 들어 있는 문서를 먼저 읽는다.

- Next.js: `node_modules/next/dist/docs/` (예: `01-app/03-api-reference/05-config/`)
- Turborepo: `node_modules/turbo/docs/` (`reference/configuration.mdx`)
- Expo: `npx expo-doctor` 로 버전 정합성 확인. 새 패키지는 `pnpm --filter @deckodecko/mobile exec expo install <pkg>` 로 넣는다 (SDK 호환 버전을 골라 줌).

## 명령

```bash
corepack enable && pnpm install        # pnpm 만 사용. npm / yarn 금지
pnpm turbo run lint typecheck build    # CI 와 동일한 검사
pnpm format                            # prettier --write
pnpm --filter @deckodecko/mobile dev   # expo start
pnpm --filter @deckodecko/admin dev    # next dev (3001)
```

PR 전에 반드시: `pnpm install --frozen-lockfile && pnpm format:check && pnpm turbo run lint typecheck build` 가 통과해야 한다. CI(`.github/workflows/ci.yml`)가 같은 명령을 돌린다.

## 규칙

- **의존성**: 루트 `package.json` 의 `packageManager` 버전을 바꾸지 않는다. 의존성을 바꾸면 `pnpm-lock.yaml` 을 같이 커밋한다. `.npmrc` 의 `node-linker=hoisted` 는 Metro 때문에 필요하니 건드리지 않는다.
- **데이터 접근**: 화면 컴포넌트에서 Supabase 를 직접 호출하지 않는다. `packages/core` 의 repository 함수 + React Query 훅을 거친다. 훅은 `@deckodecko/core/react` 에서, React 없는 것(타입 · 저장소 · 쿼리 키)은 `@deckodecko/core` 에서 가져온다. 화면에서 `useRepositories()` 로 저장소를 직접 부르지 않는다. 필요한 훅이 없으면 `packages/core/src/react/<도메인>.hooks.ts` 에 훅을 추가하고 `queryKeys` 에 키를 먼저 넣는다. 서버 컴포넌트 · 서버 액션 · 스크립트처럼 React 가 없는 곳만 저장소 함수를 직접 `await` 한다.
- **스키마**: Supabase 대시보드에서 직접 바꾸지 않는다. 항상 `supabase/migrations/*.sql` 로. 변경 후 `supabase gen types typescript` 로 타입을 다시 만든다.
- **문자열**: 화면에 한글을 하드코딩하지 않는다. i18n 리소스(ko, en)에 넣고 키로 쓴다. 날짜·가격·개수는 포맷 헬퍼를 쓴다.
- **스타일**: 화면 · 컴포넌트 코드에 색상값이나 크기 숫자를 직접 적지 않는다. 토큰 목록과 쓰는 법은 `packages/ui/README.md`.
  - 색 · 그림자: `useTheme()` 의 `colors.역할`, `shadows.이름` 만 쓴다. `palette` 원색은 화면 코드에서 쓰지 않는다. 테마는 여러 개가 될 수 있으므로 역할 이름 밖의 색을 가정하지 않는다.
  - 글자 · 간격 · 모서리 · 테두리: `@deckodecko/ui` 의 `typography` · `space` · `radius` · `border` 를 쓴다. 간격은 값이 곧 키(`space[12]`), 끝까지 둥근 모양은 `radius.full`.
  - 앱의 글자는 `@deckodecko/ui/native` 의 `Text` 로 쓴다 (`<Text variant="titleLg">`). `fontFamily` 를 직접 적지 않는다. 한글 · 원문자는 Noto Sans KR, 일본어 · 한자는 Noto Sans JP, 영어 · 숫자 · 특수문자는 Inter 로 `Text` 가 글자를 보고 자동으로 나눈다.
  - 컴포넌트 높이(버튼 54 등)는 토큰이 아니라 그 컴포넌트 파일 안의 상수로 둔다.
  - 토큰을 추가할 때: 면 위 글자색은 `on` + 면 이름(`onPrimary`, `onWish`), 글자 토큰은 종류 + 크기(`headingLg`, `captionSm`). 새 색 역할은 `src/themes/` 의 모든 테마에 값을 채운다. 글자 토큰의 줄 높이는 글자 크기의 1.25배 이상으로 둔다 (작으면 RN 이 특수문자 위아래를 자른다).
- **보안**: anon key 외의 키(service role 등)는 클라이언트 코드에 절대 넣지 않는다. 백오피스 쓰기는 Next 서버 쪽에서만.
- **범위**: 기획서의 주차별 투두 밖의 기능을 임의로 추가하지 않는다. 필요하면 먼저 제안한다.
- **웹**: 출시 대상이 아니다. `react-native-web` 은 CI 에서 Metro 번들을 검증하고(`expo export --platform web`) 로컬에서 빠르게 화면을 볼 때만 쓴다. 웹에서만 동작하는 코드를 넣지 않는다.
- **legacy/**: 참고용. 코드를 복사해 오지 말고 새로 쓴다 (레거시의 문제점은 기획서의 재개발 체크리스트 참고).

## Git

- 브랜치: `feat/<주제>`, `fix/<주제>`, `chore/<주제>`. `main` 에 직접 push 금지.
- 커밋 메시지: 한국어, 첫 줄 `type: 요약` (type = feat / fix / chore / ci / docs / refactor / test). 본문에 왜 바꿨는지.
- PR: `.github/pull_request_template.md` 양식을 채운다. 작게 쪼갠다 (리뷰 가능한 크기, 한 주제).
- 기술 결정은 `docs/adr/` 에 한 페이지 ADR 로 남긴다 (상황 · 선택지 · 결정 · 이유).

## 팀

세 명이 비동기로 일한다: 혜진(평일 상시), 여경(호주, 시차 있음), 소정(주말만). 리뷰 기한 24시간, 48시간 안에 리뷰가 없으면 혜진이 병합한다. 누가 무엇을 맡는지와 선행 관계는 기획서의 출시 일정·투두리스트 참고.
