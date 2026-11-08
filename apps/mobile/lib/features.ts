/**
 * 출시 버전에서 켜고 끄는 기능. 끈 기능은 코드 · 문구를 남겨 두고 화면에서만 숨긴다.
 * 다시 켤 때는 값을 true 로 바꾸고 해당 기능이 실제로 동작하는지 확인한다.
 */
export const features: Readonly<{
  /** 가챠 상세의 사진 인식 버튼 (1.1). 사진 인식 화면이 없어 1.0 에서는 끈다. */
  aiScan: boolean;
}> = {
  aiScan: false,
};
