import Svg, { Path } from "react-native-svg";

import type { Folder } from "@deckodecko/core";
import { folderColor, type FolderColor, type ThemeFolders } from "@deckodecko/ui";

/** 시안의 폴더 아이콘 (24 칸 기준 경로 · 선 두께) */
const FOLDER_PATH = "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z";
const STROKE_WIDTH = 1.8;

/** 면과 선 색이 다른 폴더 아이콘. 색은 folderIconColor 로 고른다 */
export function FolderIcon({ size, color }: { size: number; color: FolderColor }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d={FOLDER_PATH}
        fill={color.fill}
        stroke={color.stroke}
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 폴더 목록 안에서 이 폴더의 아이콘 색. 기본 폴더를 뺀 목록 순서로 색을 돌린다 */
export function folderIconColor(
  colors: ThemeFolders,
  folders: readonly Folder[],
  folder: Folder
): FolderColor {
  const index = folders.filter((f) => !f.isDefault).findIndex((f) => f.id === folder.id);
  return folderColor(colors, folder, index);
}
