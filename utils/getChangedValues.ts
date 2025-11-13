/**
 * 두 객체를 비교하여 변경된 값만 포함하는 새 객체를 반환합니다.
 * @param original - 원본 객체 (예: DB에서 처음 불러온 데이터)
 * @param updated - 수정한 객체 (예: 폼에서 새로 입력한 데이터)
 * @returns 변경된 필드만 포함하는 객체
 */
export default function getChangedValues<T extends object>(original: T, updated: T): Partial<T> {
  const changes: Partial<T> = {};

  // 'updated' 객체의 모든 키를 순회합니다.
  // (Partial<T>를 반환하므로 'updated'의 키만 보는 것이 안전합니다)
  for (const key in updated) {
    // 1. updated 객체가 해당 키를 실제로 소유하고 있는지 확인
    // 2. original 객체의 값과 updated 객체의 값이 다른지 확인
    if (Object.prototype.hasOwnProperty.call(updated, key) && original[key] !== updated[key]) {
      // 값이 다르면 'changes' 객체에 추가
      changes[key] = updated[key];
    }
  }

  return changes;
}
