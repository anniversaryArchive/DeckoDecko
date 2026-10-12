# 가챠 탐색대 (DeckoDecko)

애니메이션·게임 가챠(캡슐토이) 굿즈를 탐색하고 WISH / GET 으로 기록하는 모바일 앱.
2026-10-13 부터 모노레포로 다시 만든다. 기존 코드는 `legacy/` 에 있다.

## 구조

```
.
├── apps/
│   └── mobile/        # Expo 앱 (expo-router)              ← 1주차에 생성
├── packages/
│   ├── ui/            # 디자인 토큰, 공용 컴포넌트           ← 1주차에 생성
│   └── core/          # Supabase 클라이언트, 타입, 쿼리 계층  ← 1주차에 생성
├── supabase/          # 마이그레이션, RLS, RPC, seed          ← 1주차 주말에 생성
├── legacy/            # 재개발 전 코드 (참고용, 워크스페이스 제외)
├── package.json       # 루트 스크립트 (turbo 로 각 패키지 실행)
├── pnpm-workspace.yaml
└── turbo.json
```

## 시작하기

```bash
corepack enable          # package.json 의 packageManager(pnpm 10) 사용
pnpm install
pnpm lint                # turbo run lint   (모든 워크스페이스)
pnpm typecheck           # turbo run typecheck
pnpm test                # turbo run test
pnpm dev                 # turbo run dev    (apps/mobile 이 생기면 expo start)
```

Node 22 이상 (`.nvmrc`). 패키지 매니저는 pnpm 만 쓴다 (`npm install` / `yarn` 금지).

## legacy/ 를 실행해야 할 때

```bash
cd legacy
npm install
npx expo start
```

`legacy/` 는 pnpm 워크스페이스에 포함되지 않으며, 새 코드에서 import 하지 않는다.

## 문서

- 기획서: https://claude.ai/code/artifact/87862d93-1288-4f9b-b980-35cad0573692
- 디자인 (시안 B 확정): https://claude.ai/artifact/H59s4ezb8jvh6ttSpJ4mpW
