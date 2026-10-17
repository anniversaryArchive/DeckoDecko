/**
 * React Native 전용 컴포넌트. 앱(apps/mobile)만 import 한다.
 * 백오피스(Next.js)는 react-native 가 없어 이 입구를 import 하면 빌드가 깨진다. 토큰 · 테마는 `@deckodecko/ui` 에서.
 */
export { Text, type TextProps } from "./Text";
