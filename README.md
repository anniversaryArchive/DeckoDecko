# 가챠 탐색대 (DeckoDecko)

애니메이션·게임 가챠(캡슐토이) 굿즈를 탐색하고 WISH / GET 으로 기록하는 모바일 앱.
2026-10-13 부터 모노레포로 다시 만든다. 기존 코드는 `legacy/` 에 있다.

## 구조

```
.
├── apps/
│   ├── mobile/        # Expo 앱 (expo-router)
│   └── admin/         # Next.js 백오피스 (운영자용, 포트 3001)
├── packages/
│   ├── ui/            # 디자인 토큰, 공용 컴포넌트
│   └── core/          # Supabase 클라이언트, 타입, 쿼리 계층
├── supabase/          # 백엔드: 마이그레이션, RLS, RPC, seed
├── legacy/            # 재개발 전 코드 (참고용, 워크스페이스 제외)
├── package.json       # 루트 스크립트 (turbo 로 각 패키지 실행)
├── pnpm-workspace.yaml
└── turbo.json
```

아직 없는 폴더(`packages/*`, `supabase/` 내용)는 생기는 대로 채운다. 일정은 기획서 참고.

````

## 시작하기

```bash
corepack enable          # package.json 의 packageManager(pnpm 10) 사용
pnpm install
pnpm lint                # turbo run lint   (모든 워크스페이스)
pnpm typecheck           # turbo run typecheck
pnpm test                # turbo run test
pnpm dev                 # turbo run dev    (expo start + next dev 동시 실행)
pnpm --filter @deckodecko/mobile dev   # 앱만
pnpm --filter @deckodecko/admin dev    # 백오피스만 (http://localhost:3001)
````

Node 22.12 이상 (`.nvmrc`, `require(esm)` 때문). 패키지 매니저는 pnpm 만 쓴다 (`npm install` / `yarn` 금지).

## 편집기 설정

코드 스타일은 Prettier(`.prettierrc`)와 ESLint(`packages/eslint-config`)가 정하고 CI 가 검사한다. 저장할 때 자동으로 맞춰지게 해 두면 CI 에서 걸릴 일이 없다.

- **VS Code**: 저장소를 열면 권장 확장(Prettier, ESLint, EditorConfig, Expo Tools) 설치 안내가 뜬다. `.vscode/settings.json` 이 저장 시 포맷 + ESLint 자동 수정을 켠다.
- **IntelliJ / WebStorm**: Settings → Languages & Frameworks → JavaScript → Prettier 에서 "Automatic Prettier configuration" 과 "Run on save" 를 켜고, 같은 곳의 ESLint 에서 "Automatic ESLint configuration" 과 "Run eslint --fix on save" 를 켠다. `.editorconfig` 는 자동으로 읽는다.
- 수동으로 맞추려면 `pnpm format` 과 `pnpm lint -- --fix`.

## legacy/ 를 실행해야 할 때

```bash
cd legacy
npm install
npx expo start
```

`legacy/` 는 pnpm 워크스페이스에 포함되지 않으며, 새 코드에서 import 하지 않는다.

## 문서

- 기획서: https://claude.ai/code/artifact/e668b2ee-acd5-4991-b030-c40a839ce738
- 디자인: https://claude.ai/artifact/X8gVyKo8QVoCMaqj2evY7G
