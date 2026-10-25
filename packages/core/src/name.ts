/**
 * 이름 중복 비교용. 앞뒤 공백 · 대소문자 · 전각/반각 차이는 같은 이름으로 본다.
 * 저장할 때는 trim 만 하고 원래 모양을 지킨다.
 */
export function normalizeName(name: string): string {
  return name.normalize("NFKC").trim().toLowerCase();
}

/** 저장 전 이름 정리. 비어 있으면 던진다 (화면이 먼저 막지만, 저장소도 빈 이름을 받지 않는다). */
export function cleanName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("name must not be empty");
  return trimmed;
}
