# 0007. Reanimated 의 FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS 를 끈다

- 날짜: 2026-11-17
- 관련: #258, #259, #268, software-mansion/react-native-reanimated#10805, software-mansion/react-native-reanimated#9527

## 상황

가챠 상세 소장률 칸 막대 색이 기록과 다르게 멈추는 버그(#258)의 원인이 Reanimated 4.5.1 에 있다.

- 이 플래그가 켜져 있으면(4.3 부터 기본값) 애니메이션이 끝난 값을 JS 타이머(500ms 간격)가 React 상태로 옮기고, 네이티브 쪽 기록은 JS 타이머가 돌 때 2초 지난 항목을 먼저 지운다.
- JS 스레드가 1초 넘게 막혀 타이머가 늦으면, 끝난 값이 React 로 넘어가기 전에 지워진다. 그 뒤 그 뷰가 다시 렌더되면 처음 마운트 때의 색으로 돌아간다.
- 같은 버그가 업스트림 software-mansion/react-native-reanimated#10805 (software-mansion/react-native-reanimated#9965) 로 보고됐고 4.6.0 의 software-mansion/react-native-reanimated#9527 에서 고쳐졌다. Expo SDK 57 은 4.5.1 을 쓴다.

## 선택지

| 선택지                                         | 장점                                                                     | 단점                                                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 플래그를 끈다 (`package.json` 의 `reanimated`) | 업스트림이 안내한 우회. 칸 막대 · 태그 · 시트 등 앱 전체가 함께 고쳐진다 | 네이티브 설정이라 새 빌드가 필요하다 (EAS Update 로는 안 간다)                                                                 |
| Reanimated 4.6 이상으로 올린다                 | 원인을 고친 버전                                                         | Expo SDK 57 이 고른 버전이 아니다. worklets 를 같이 올려야 하고 위험이 크다                                                    |
| `useColorTransition` 에서 JS 로 막는다         | EAS Update 로 보낼 수 있다                                               | 이미 넘어간 옛 값이 새 값을 덮는 경우까지 막으려면 뷰를 다시 마운트해야 해서 썸네일이 깜빡일 수 있다. 다른 애니메이션은 그대로 |

## 결정

`apps/mobile/package.json` 에 `"reanimated": { "staticFeatureFlags": { "FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS": false } }` 를 넣는다.
iOS 에서 Reanimated 를 항상 소스로 빌드하도록 같은 파일에 `"expo": { "autolinking": { "ios": { "buildFromSource": ["react-native-reanimated"] } } }` 도 넣는다.
4.3 이전처럼 끝난 값을 뷰가 사라질 때까지 네이티브 기록에 두고 React 커밋마다 다시 적용한다.

## 이유

- 원인이 라이브러리에 있고, 업스트림이 고친 버전 전까지 권하는 방법이다.
- 앱 코드는 그대로 두고 package.json 설정만으로 앱 전체의 같은 문제를 막는다.

## 알아 둘 것

- 네이티브 설정이다. 반영하려면 새 빌드(`expo run:ios` · EAS Build)가 필요하고, 이미 깔린 1.0 앱에는 EAS Update 로 가지 않는다.
- iOS 에서 Expo 미리 빌드 모듈(`EXPO_USE_PRECOMPILED_MODULES`, Podfile 기본값 켜짐)을 쓰면 RNReanimated 가 `expo-modules-autolinking/external-configs/ios/react-native-reanimated/spm.config.json` 의 고정 플래그(이 플래그 `true`)로 컴파일돼 `staticFeatureFlags` 가 무시된다. 그래서 `buildFromSource` 를 같이 둔다 (pod install 로그 `RNReanimated: building from source (configured by buildFromSource)`).
- 끈 부작용: animated style 을 떼면 원래 스타일로 돌아가는 4.3 이전 동작이 돌아오고, React 커밋마다 레지스트리 값을 다시 적용하는 비용이 든다. 이 앱의 애니메이션 수에서는 무시할 수준이다.
- Reanimated 를 4.6 이상으로 올리면 두 설정을 지운다. `apps/mobile/lib/reanimatedFlags.test.ts` 가 버전을 보고 알려 준다.
