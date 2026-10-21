# @deckodecko/mobile

가챠 탐색대 Expo 앱 (SDK 57, expo-router).

```bash
pnpm --filter @deckodecko/mobile dev      # expo start
pnpm --filter @deckodecko/mobile ios      # iOS 시뮬레이터
pnpm --filter @deckodecko/mobile android  # Android 에뮬레이터
pnpm --filter @deckodecko/mobile run doctor   # expo-doctor 로 의존성 버전 점검 (run 을 빼면 pnpm 자체의 doctor 명령이 실행됨)
pnpm --filter @deckodecko/mobile exec expo start --web   # 브라우저에서 빠르게 확인 (출시 대상 아님)
```

- CI 는 `doctor`(버전 비교 · React Native Directory 검사 제외, 스키마 조회처럼 서버에 닿지 못한 실패는 경고)와 `EXPO_OFFLINE=1 expo install --check`(lockfile 의 expo 기준 버전 비교)로 막는다. 버전 검사가 실패하면 `pnpm --filter @deckodecko/mobile exec expo install --fix` 로 맞춘다. Directory 검사는 별도 단계에서 경고만 남긴다.
- 주간 workflow(`.github/workflows/expo-weekly-update.yml`)가 매주 월요일 09:00(KST) Expo SDK 권장 패치를 확인하고, 뒤처졌으면 `expo install --fix` 결과로 PR 을 연다. 그 안의 doctor 도 CI 와 같은 설정으로 돈다.
- `app/(tabs)/` 홈 · 내 굿즈 · 검색 탭, `app/gacha/[id].tsx` 상세 스택.
- 아이콘·스플래시·글꼴은 여경이 `packages/ui` 작업과 함께 붙인다. 디자인 토큰은 `@deckodecko/ui` 에서 가져온다.

## 문구 (i18n)

1. 화면에 보이는 글자는 `lib/i18n/ko.ts` 에 키를 먼저 만들고 `en.ts` 에 같은 키를 채운다. 한쪽만 있으면 타입 오류가 난다.
2. 키는 `화면.요소` (`home.title`, `detail.notFound`). 여러 화면이 같이 쓰면 `common` 에 둔다.
3. 화면에서는 `const { t } = useTranslation()` 후 `t("home.title")`. 값은 `{{id}}` 로 넣는다 (`t("detail.notFound", { id })`).
4. 가격 · 날짜 · 개수는 문구에 단위를 직접 붙이지 않고 `formatPrice` · `formatMonth` · `formatDate` · `formatItemCount` (`@/lib/i18n`) 를 쓴다.
5. 기기 언어가 지원 언어(ko · en)에 없으면 en 으로 보인다 (앱 이름과 같은 규칙: ko 만 한국어). 앱을 쓰는 중에 기기 언어를 바꾸면 바로 따라간다.

## TODO

- [ ] `app.json` 에 `icon`, `splash`(배경 `#FFF9F4`), Android `adaptiveIcon` 추가 — 로고 SVG 를 1024px PNG 로 내보내 사용 (여경)
