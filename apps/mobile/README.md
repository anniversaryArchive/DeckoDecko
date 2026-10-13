# @deckodecko/mobile

가챠 탐색대 Expo 앱 (SDK 57, expo-router).

```bash
pnpm --filter @deckodecko/mobile dev      # expo start
pnpm --filter @deckodecko/mobile ios      # iOS 시뮬레이터
pnpm --filter @deckodecko/mobile android  # Android 에뮬레이터
pnpm --filter @deckodecko/mobile doctor   # expo-doctor 로 의존성 버전 점검
```

- `app/(tabs)/` 홈 · 내 굿즈 · 검색 탭, `app/gacha/[id].tsx` 상세 스택.
- 아이콘·스플래시·글꼴·디자인 토큰은 `packages/ui` 와 함께 1주차 워홀 작업에서 붙인다.

## TODO

- [ ] `app.json` 에 `icon`, `splash`(배경 `#FFF9F4`), Android `adaptiveIcon` 추가 — 디자인 캔버스의 로고로 1024px PNG 내보내기 (여경)
