# brand

앱 아이콘 · 스플래시 이미지. 디자인 시안 `B_Logo`(확정: 크림 + 투톤)와 `B_Splash` 기준이다.

| 파일                       | 쓰는 곳                                                                  | 크기 |
| -------------------------- | ------------------------------------------------------------------------ | ---- |
| `icon`                     | iOS 앱 아이콘 (`expo.icon`). 투명 없이 꽉 채운다 (모서리는 OS 가 깎는다) | 1024 |
| `adaptive-icon-foreground` | Android 적응형 아이콘 앞면. 마크가 보이는 영역(가운데 2/3)의 60%         | 1024 |
| `adaptive-icon-monochrome` | Android 13 테마 아이콘 (모양만 쓴다)                                     | 1024 |
| `splash`                   | 스플래시 마크 (`imageWidth` 128). 바깥을 스플래시 배경색으로 채운다      | 512  |

고칠 때는 `.svg` 를 고치고 같은 크기의 `.png` 를 다시 만든다. 앱은 `.png` 만 쓴다.

```sh
# 이 폴더에서. 파일 이름과 크기는 위 표대로. icon · splash 는 투명이 없어야 해서 flatten 한다 (나머지는 .flatten() 을 뺀다)
node -e 'require("sharp")(process.argv[1]).resize(+process.argv[2]).flatten().png().toFile(process.argv[1].replace(".svg", ".png"))' splash.svg 512
```

- `splash` 에 투명한 곳이 있으면 `expo-splash-screen` 이 이미지를 다시 만들 때 반투명 가장자리가 검게 변해 회색 테두리가 보인다. SVG 맨 앞의 배경 사각형은 지우지 않는다 (`.flatten()` 은 투명한 곳을 검정으로 채운다).
- PNG 는 sharp 0.35.5 로 만들었다. mobile 의존성이 아니라 `apps/admin` 의 `next` 를 통해 들어온다.
- 브랜드 색은 `app.json`(`adaptiveIcon.backgroundColor` · 스플래시 `backgroundColor`), 이 폴더의 SVG, `packages/ui/src/tokens.ts`(`cream` · `blush` 등)에 따로 적혀 있다. 하나를 바꾸면 나머지도 같이 고친다.
