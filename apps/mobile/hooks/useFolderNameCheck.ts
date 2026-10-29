import { useTranslation } from "react-i18next";

import { normalizeName } from "@deckodecko/core";
import { useIsFolderNameTaken } from "@deckodecko/core/react";

import { languages } from "@/lib/i18n/types";
import { NAME_CHECK_DELAY, useDebouncedValue } from "@/lib/useDebouncedValue";

/** 폴더 이름 최대 글자 수 (시안 B_FolderRename). 저장소는 길이를 막지 않으므로 입력 칸에서 막는다 */
export const FOLDER_NAME_MAX_LENGTH = 20;

/**
 * 폴더 이름 입력의 중복 검사 (새 폴더 · 이름 변경). excludeId 는 이름을 바꾸는 폴더 자신.
 * - taken: 지금 이름이 이미 쓰이고 있다 (결과가 오기 전이면 false)
 * - checked: 지금 이름의 검사 결과가 왔고 겹치지 않는다. 저장소는 중복을 막지 않으므로 이게 true 일 때만 저장한다.
 */
export function useFolderNameCheck(name: string, excludeId?: string) {
  const { t } = useTranslation();
  const checkedName = useDebouncedValue(name, NAME_CHECK_DELAY);
  const query = useIsFolderNameTaken(checkedName, excludeId);
  // 기본 폴더는 DB 이름이 비어 있어 저장소 검사로는 못 잡는다. 언어를 바꿔도 겹치지 않게 모든 언어의 표시 이름과 비교한다
  const takenByDefault = languages.some(
    (lng) => normalizeName(name) === normalizeName(t("folder.defaultName", { lng }))
  );
  return {
    taken: takenByDefault || query.data === true,
    checked: !takenByDefault && checkedName === name && query.data === false,
  };
}
