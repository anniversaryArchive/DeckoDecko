# @deckodecko/mobile

가챠 탐색대 Expo 앱 (SDK 57, expo-router).

```bash
pnpm --filter @deckodecko/mobile dev      # expo start
pnpm --filter @deckodecko/mobile ios      # iOS 시뮬레이터
pnpm --filter @deckodecko/mobile android  # Android 에뮬레이터
pnpm --filter @deckodecko/mobile run doctor   # expo-doctor 로 의존성 버전 점검 (run 을 빼면 pnpm 자체의 doctor 명령이 실행됨)
pnpm --filter @deckodecko/mobile exec expo start --web   # 브라우저에서 빠르게 확인 (출시 대상 아님)
```

- CI 는 `doctor` 의 패키지 버전 비교만 경고로 남기고 나머지 검사는 막는다. 경고가 뜨면 `pnpm --filter @deckodecko/mobile exec expo install --fix` 로 맞춘다.
- `app/(tabs)/` 홈 · 내 굿즈 · 검색 탭, `app/gacha/[id].tsx` 상세 스택.
- 아이콘·스플래시·글꼴은 여경이 `packages/ui` 작업과 함께 붙인다. 디자인 토큰은 `@deckodecko/ui` 에서 가져온다.

## TODO

- [ ] `app.json` 에 `icon`, `splash`(배경 `#FFF9F4`), Android `adaptiveIcon` 추가 — 로고 SVG 를 1024px PNG 로 내보내 사용 (여경)
