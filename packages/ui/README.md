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
  - 이 입구를 쓰는 앱은 `react-native` · `@gorhom/bottom-sheet` · `react-native-gesture-handler` · `react-native-reanimated` · `react-native-safe-area-context` 를 **모두** 설치해야 한다. `Text` 만 써도 마찬가지다 (`Input` 이 시트 라이브러리를 import 하고, 입구 하나로 같이 내보내기 때문).
  - `package.json` 에는 이 라이브러리들이 선택(optional) peer 로 적혀 있다. 기본 입구(`@deckodecko/ui`)만 쓰는 백오피스에는 필요 없어서다. peer 설정은 입구별로 나눌 수 없다.
- 테마마다 달라지는 것은 **색(`colors`), 그림자(`shadows`), 폴더 아이콘 색(`folders`)** 뿐이다. 글꼴 · 크기 · 간격 · 모서리는 공통.

### 새 테마 추가

1. `src/themes/<이름>.ts` 를 만들고 `colors` · `shadows` · `folders` 를 모두 채운다. 빠진 역할이 있으면 타입 오류가 난다. 새 원색은 `palette` 에 추가.
2. `src/themes/index.ts` 의 `themes` 에 한 줄 추가.
3. 화면 · 컴포넌트 코드는 바꾸지 않는다. 역할이 부족하면 `ThemeColors` 에 역할을 추가하고 **모든 테마**에 값을 채운다.
4. 어두운 테마면 `scheme: "dark"` (상태 바 글자가 밝아진다).

기본 테마를 바꾸면 `apps/mobile/app.json` 의 `backgroundColor`(스플래시 바탕)를 새 기본 테마의 `bg` 로 손으로 맞춘다.

- 빌드 단계 없이 TS 소스를 그대로 내보낸다. Next.js 쪽은 `transpilePackages` 에 이 패키지를 적어 둔다.

### 공통 토큰

| 토큰         | 쓰는 법                                                          | 비고                                                                             |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `typography` | `typography.body.fontSize`, `.lineHeight`                        | "종류 + 크기" (`headingLg`, `titleSm`, `caption` …)                              |
| `space`      | `space[12]`, 화면 좌우 여백은 `gutter`                           | 시안이 2px 단위라 값이 곧 키. 없는 값은 가까운 단계로                            |
| `radius`     | `radius.card`, 둥근 버튼 · 칩은 `radius.full`                    | 끝까지 둥근 것(정사각형이면 원형)은 모두 `full`                                  |
| `border`     | `border.default`(1.5), `border.divider`(1)                       |                                                                                  |
| `shadows`    | RN `boxShadow: theme.shadows.toast`, 웹 `var(--shadow-toast)`    | 테마마다 다름. CSS 문자열이라 양쪽에서 씀 (RN New Architecture)                  |
| `folders`    | `folderColor(theme.folders, folder, index)` → `{ fill, stroke }` | 테마마다 다름. 기본 폴더는 고정 색, 나머지는 `cycle` 을 목록 순서대로 돌림       |
| `fonts`      | 직접 쓰지 않음. 앱은 `Text`, 웹은 `fonts.web` 스택               | `sans`(Noto Sans KR) · `ja`(Noto Sans JP) · `latin`(Inter) 의 굵기별 family 이름 |

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

- 글꼴은 `Text` 가 글자를 보고 자동으로 고른다. **한글 · 원문자(①⑳)는 Noto Sans KR, 일본어 · 한자는 Noto Sans JP, 영어 · 숫자 · 특수문자는 Inter.** Noto Sans KR 에는 한자가 8천 자 정도뿐이라 일본어 한자(込 様 桜 …)가 빠져 있어서 나눴다. DB 에서 온 글이나 번역 문장도 그대로 넘기면 된다.
- 화면에서 `fontFamily` · `fontSize` · `fontWeight` 를 직접 적지 않는다. 특히 `fontWeight` 를 넘기면 Android 에서 시스템 글꼴로 바뀐다.
- 큰 글자(`displayLg` · `displaySm`)는 시스템 글자 크기를 키워도 1.5배까지만 커진다 (`maxFontSizeMultiplier`). 그 이상이면 화면 폭을 넘는다. 나머지 글자는 제한 없이 커진다.
- `style` 에는 `fontWeight` · `fontFamily` 를 넘길 수 없다 (타입 오류). 굵기는 `weight` 로.
- iOS 는 한글을 띄어쓰기 단위로 줄바꿈한다 (`lineBreakStrategyIOS="hangul-word"` 기본값). Android 는 같은 옵션이 없어서 글자 단위로 줄이 바뀔 수 있다.
- 내비게이션 머리글 · 탭 이름처럼 `Text` 를 거치지 않는 글자는 `fonts.sans.bold` 를 직접 지정한다 (`apps/mobile/app/_layout.tsx` 참고).

### 공용 컴포넌트

모두 `@deckodecko/ui/native` 에서 가져온다. 앱에서는 개발 빌드의 홈 → "컴포넌트 카탈로그"(`/dev/components`)에서 모든 종류와 상태를 볼 수 있다. 색 · 크기는 컴포넌트가 정하므로 화면에서 덮어쓰지 않는다 (배치용 `style` 만 넘긴다).

```tsx
import { BottomSheet, Button, Card, Chip, Input, Segment } from "@deckodecko/ui/native";

<Button onPress={save} fullWidth>{t("item.add")}</Button>
<Chip selected={filter === "all"} onPress={() => setFilter("all")}>{t("filter.all")}</Chip>
<Segment value={status} onChange={setStatus} options={[{ value: "wish", label: "WISH" }, { value: "get", label: "GET", tone: "get" }]} />
<Input label={t("item.name")} value={name} onChangeText={setName} />
<Card onPress={open} style={{ padding: space[12] }}>…</Card>
<BottomSheet open={open} onClose={() => setOpen(false)} title={t("item.add")} closeLabel={t("common.close")}>…</BottomSheet>
```

| 컴포넌트      | 고르는 것                                                                                                                                                                                                       | 높이                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `Button`      | `variant`: `primary` · `secondary` · `outline` · `soft` · `danger`, `size`: `lg` · `md` · `sm`, `icon`                                                                                                          | 54 · 44 · 36          |
| `Chip`        | `selected`, 선택 면 `selectedTone`: `primary` · `inverse`, 오른쪽 `trailing`                                                                                                                                    | 34                    |
| `Segment`     | `options` 의 `tone`: `primary` · `wish` · `get` (선택된 항목의 면)                                                                                                                                              | 항목 40               |
| `Input`       | `label`, `helperText`, 안쪽 `leading` · `trailing`, `multiline`. 글자가 있으면 지우기 버튼이 나온다 (읽기 이름 `clearLabel` 을 넘겨야 그린다, `clearable={false}` 로 끔). `ref` 로 입력창에 포커스를 줄 수 있다 | 48, 여러 줄은 72 이상 |
| `Card`        | `variant`: `default` · `highlight`, `onPress` 를 넘기면 눌리는 카드. 안쪽 여백은 `style` 로                                                                                                                     | 내용에 맞춤           |
| `BottomSheet` | `open` · `onClose` 로 연다. `title`, `closeLabel`(넘기면 닫기 버튼). 열고 닫을 때 0.45초 동안 올라오고 내려간다                                                                                                 | 내용에 맞춤           |

- 글자는 모두 props 로 받는다. 컴포넌트 안에 한글을 적지 않는다 (닫기 버튼의 읽기 이름도 `closeLabel` 로).
- `BottomSheet` 는 `@gorhom/bottom-sheet` 를 감싼 것이다. 앱 루트에 `GestureHandlerRootView` 와 `BottomSheetModalProvider` 가 있어야 한다 (`apps/mobile/app/_layout.tsx`). 시트 안의 `Input` 은 키보드가 올라오면 시트도 같이 올라간다.
- `onClose` 는 사용자가 닫았을 때(끌기 · 뒤 배경 · 닫기 버튼 · Android 뒤로가기)만 불린다. 화면이 `open={false}` 로 닫거나 화면이 사라질 때는 불리지 않는다.
- 시트에서 다른 화면으로 이동할 때는 **먼저 `open` 을 `false` 로 바꾼다.** 시트 Provider 가 앱 루트에 있어서, 열린 채로 이동하면 시트가 새 화면 위에 남는다.
- 선 아이콘 `CloseIcon`(×) · `ChevronDownIcon`(⌄)은 `size` · `color`(색 역할)를 받는다. 칩의 펼침 표시는 `<Chip trailing={<ChevronDownIcon size={14} color="text" />}>`.
- `Input` 은 RN `TextInput` 이 글꼴을 하나만 쓸 수 있어서 Noto Sans KR 로 고정한다.
- 시안에 오류 상태 색이 없어서 `Input` 에는 오류 표시가 아직 없다. 필요해지면 색 역할(`danger` 등)부터 추가한다.

### 글꼴 굵기 추가

지금은 400 · 500 · 700 만 넣었다. 굵기를 추가하려면 세 곳을 같이 고친다.

1. `src/tokens.ts`: `fonts.weight`, `fonts.sans`, `fonts.ja`, `fonts.latin` 에 굵기 추가.
2. `apps/mobile/app/_layout.tsx`: `useFonts` 에 글꼴 추가. 굵기별 경로로 import 한다 (`@expo-google-fonts/inter/600SemiBold`). 패키지 루트에서 import 하면 안 쓰는 굵기까지 전부 앱에 들어간다.
3. `apps/admin/app/layout.tsx`: `next/font` 의 `weight` 배열에 추가.

Noto Sans KR · JP 는 굵기를 하나 추가할 때마다 앱 용량이 각각 약 6MB 씩 늘어난다.
