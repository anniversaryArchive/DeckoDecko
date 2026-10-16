# @deckodecko/ui

디자인 토큰과 테마, 공용 컴포넌트.

```ts
// 화면 코드
const { colors } = useTheme();
<View style={{ backgroundColor: colors.bg }} />

// 루트 레이아웃 (앱)
<ThemeProvider theme="peachCream">…</ThemeProvider>

// 웹 루트 레이아웃
<html style={themeToCssVars(themes[defaultThemeName])}>   // CSS 에서 var(--color-bg)
```

- `src/tokens.ts`: `palette`(원색), `Theme` 의 모양(색 역할 · 그림자), 공통 토큰.
- `src/themes/`: 테마 값. 파일 하나가 테마 하나 (`peachCream.ts`).
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
| `fonts`      | 글꼴 스택과 굵기                                              | 실제 family 이름 연결은 Text 래퍼(#110)                         |

컴포넌트 높이(버튼 54 · 38, 입력창 48 등)는 토큰에 두지 않고 각 컴포넌트 파일 안의 상수로 둔다. 컴포넌트마다 한 번씩만 쓰이는 값이라 토큰으로 빼도 공유되지 않는다.
