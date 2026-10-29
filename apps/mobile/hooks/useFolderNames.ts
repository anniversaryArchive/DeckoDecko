import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Folder } from "@deckodecko/core";

import { folderName } from "@/lib/displayName";

/** 폴더 id → 표시 이름 (기본 폴더는 언어별 문구) */
export function useFolderNames(folders: Folder[]): ReadonlyMap<string, string> {
  const { t } = useTranslation();
  return useMemo(() => new Map(folders.map((f) => [f.id, folderName(f, t)])), [folders, t]);
}
