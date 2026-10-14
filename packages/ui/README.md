# @deckodecko/ui

디자인 토큰과 테마, 공용 컴포넌트.

```ts
// 화면 코드
const { colors } = useTheme();
<View style={{ backgroundColor: colors.bg }} />
<Text variant="titleLg">{gacha.name}</Text>   // Text 는 @deckodecko/ui/native

// 루트 레이아웃 (앱)
<ThemeProvider theme="peachCream">…</ThemeProvider>

// 웹 루트 레이아웃
<html style={themeToCssVars(themes[defaultThemeName])}>   // CSS 에서 var(--color-bg)
```

- `src/tokens.ts`: `palette`(원색), `Theme` 의 모양(색 역할 · 그림자), 공통 토큰.
- `src/themes/`: 테마 값. 파일 하나가 테마 하나 (`peachCream.ts`).
- `src/native/`: React Native 컴포넌트 (`Text` …). **`@deckodecko/ui/native`** 로 따로 내보낸다. 백오피스는 react-native 가 없으므로 이 입구를 import 하지 않는다.
- 테마마다 달라지는 것은 **색(`colors`)과 그림자(`shadows`)** 뿐이다. 글꼴 · 크기 · 간격 · 모서리는 공통.

### 새 테마 추가

1. `src/themes/<이름>.ts` 를 만들고 `colors` · `shadows` 를 모두 채운다. 빠진 역할이 있으면 타입 오류가 난다. 새 원색은 `palette` 에 추가.
2. `src/themes/index.ts` 의 `themes` 에 한 줄 추가.
3. 화면 · 컴포넌트 코드는 바꾸지 않는다. 역할이 부족하면 `ThemeColors` 에 역할을 추가하고 **모든 테마**에 값을 채운다.
4. 어두운 테마면 `scheme: "dark"` (상태 바 글자가 밝아진다).

기본 테마를 바꾸면 `apps/mobile/app.json` 의 `backgroundColor`(스플래시 바탕)를 새 기본 테마의 `bg` 로 손으로 맞춘다.

- 빌드 단계 없이 TS 소스를 그대로 내보낸다. Next.js 쪽은 `transpilePackages` 에 이 패키지를 적어 둔다.

### 공통 토큰

| 토큰         | 쓰는 법                                                       | 비고                                                            |
| ------------ | ------------------------------------------------------------- | --------------------------------------------------------------- |
| `typography` | `typography.body.fontSize`, `.lineHeight`                     | "종류 + 크기" (`headingLg`, `titleSm`, `caption` …)             |
| `space`      | `space[12]`, 화면 좌우 여백은 `gutter`                        | 시안이 2px 단위라 값이 곧 키. 없는 값은 가까운 단계로           |
| `radius`     | `radius.card`, 둥근 버튼 · 칩은 `radius.full`                 | 끝까지 둥근 것(정사각형이면 원형)은 모두 `full`                 |
| `border`     | `border.default`(1.5), `border.divider`(1)                    |                                                                 |
| `shadows`    | RN `boxShadow: theme.shadows.toast`, 웹 `var(--shadow-toast)` | 테마마다 다름. CSS 문자열이라 양쪽에서 씀 (RN New Architecture) |
| `fonts`      | 직접 쓰지 않음. 앱은 `Text`, 웹은 `fonts.web` 스택            | `sans`(Noto Sans KR) · `latin`(Inter) 의 굵기별 family 이름     |

글자 토큰의 줄 높이는 글자 크기의 1.25배 이상으로 둔다. Inter 의 기본 높이가 글자 크기의 1.21배라서, 이보다 작으면 RN 이 `( ) $ @ |` 같은 특수문자의 위아래를 자른다.

컴포넌트 높이(버튼 54 · 38, 입력창 48 등)는 토큰에 두지 않고 각 컴포넌트 파일 안의 상수로 둔다. 컴포넌트마다 한 번씩만 쓰이는 값이라 토큰으로 빼도 공유되지 않는다.

### 앱 글자: `Text`

```tsx
import { Text } from "@deckodecko/ui/native";

<Text variant="headingLg">숲속 친구들 마스코트 Vol.2</Text>
<Text variant="caption" color="textMuted" weight="bold">1회 400엔</Text>
```

| prop      | 설명                          | 기본값                 |
| --------- | ----------------------------- | ---------------------- |
| `variant` | 글자 토큰 이름                | `body`                 |
| `weight`  | `regular` · `medium` · `bold` | `variant` 의 기본 굵기 |
| `color`   | 색 역할 이름                  | `text`                 |

- 글꼴은 `Text` 가 글자를 보고 자동으로 고른다. **한글 · 한자 · 일본어는 Noto Sans KR, 영어 · 숫자 · 특수문자는 Inter.** DB 에서 온 글이나 번역 문장도 그대로 넘기면 된다.
- 화면에서 `fontFamily` · `fontSize` · `fontWeight` 를 직접 적지 않는다. 특히 `fontWeight` 를 넘기면 Android 에서 시스템 글꼴로 바뀐다.
- iOS 는 한글을 띄어쓰기 단위로 줄바꿈한다 (`lineBreakStrategyIOS="hangul-word"` 기본값). Android 는 같은 옵션이 없어서 글자 단위로 줄이 바뀔 수 있다.
- 내비게이션 머리글 · 탭 이름처럼 `Text` 를 거치지 않는 글자는 `fonts.sans.bold` 를 직접 지정한다 (`apps/mobile/app/_layout.tsx` 참고).

### 글꼴 굵기 추가

지금은 400 · 500 · 700 만 넣었다. 굵기를 추가하려면 세 곳을 같이 고친다.

1. `src/tokens.ts`: `fonts.weight`, `fonts.sans`, `fonts.latin` 에 굵기 추가.
2. `apps/mobile/app/_layout.tsx`: `useFonts` 에 글꼴 추가. 굵기별 경로로 import 한다 (`@expo-google-fonts/inter/600SemiBold`). 패키지 루트에서 import 하면 안 쓰는 굵기까지 전부 앱에 들어간다.
3. `apps/admin/app/layout.tsx`: `next/font` 의 `weight` 배열에 추가.

Noto Sans KR 은 굵기를 하나 추가할 때마다 앱 용량이 약 6MB 씩 늘어난다.
