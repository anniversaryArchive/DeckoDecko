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

- `src/tokens.ts`: `palette`(원색) → `themes`(역할별 색) → `fonts` · `radius` · `space`(공통).
- 새 테마 추가: `themes` 에 항목을 넣고 `ThemeColors` 의 역할을 모두 채운다. 화면 코드는 바꾸지 않는다.
- 빌드 단계 없이 TS 소스를 그대로 내보낸다. Next.js 쪽은 `transpilePackages` 에 이 패키지를 적어 둔다.
