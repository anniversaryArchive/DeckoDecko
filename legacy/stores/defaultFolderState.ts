import { create } from "zustand";
import type { TFolder } from "@/types/folder";

interface IDefaultFolderState {
  // 예시: 사용자의 테마 설정을 저장한다고 가정
  folder: TFolder | null;
  // SQLite에서 값을 가져와 스토어를 초기화하는 함수
  initializeFolder: (loadedFolder: TFolder) => void;
}

export const defaultFolderState = create<IDefaultFolderState>((set) => ({
  folder: null,
  initializeFolder: (loadedFolder) =>
    set({
      folder: loadedFolder,
    }),
}));
