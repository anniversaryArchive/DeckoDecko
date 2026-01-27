import { useCallback, useEffect, useState } from "react";
import { Alert, Keyboard } from "react-native";
import folder from "@table/folders";
import { activeBottomSheet } from "@/stores/activeBottomSheet";
import type { TFolder } from "@/types/folder";

type TSheetName = "FOLDER_SELECT" | "FOLDER_ADD" | "FOLDER_EDIT";

interface UseFolderListOptions {
  withLoading?: boolean;
}

// 폴더 목록 조회
export const useFolderList = (options: UseFolderListOptions = {}) => {
  const { withLoading = false } = options;
  const [folderList, setFolderList] = useState<TFolder[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFolderList = useCallback(async () => {
    if (withLoading) setLoading(true);
    try {
      const folderList = await folder.getAll();
      setFolderList(folderList);
    } catch (error) {
      console.error("[ERROR] useFolderList loadFolderList : ", error);
    } finally {
      if (withLoading) setLoading(false);
    }
  }, [withLoading]);

  return { folderList, loading, loadFolderList };
};

// 폴더 유효성 검사
export const useFolderValidation = (
  folderList: TFolder[],
  options: { excludeFolderName?: string } = {}
) => {
  const { excludeFolderName } = options;

  const validateFolderName = useCallback(
    (value: string) => {
      if (!value.trim()) return;

      // 현재 폴더 이름과 같으면 통과 (Edit 모드)
      if (excludeFolderName && value === excludeFolderName) return true;

      const isExist = folderList.some(({ name }) => name === value);
      if (isExist)
        return Alert.alert("같은 폴더는 둘이 될 수 없어요!", undefined, [{ text: "확인" }]);

      return true;
    },
    [folderList, excludeFolderName]
  );
  return { validateFolderName };
};

interface UseFolderSheetOptions {
  sheetName: TSheetName;
  parentHandleClose?: () => void;
  dismissKeyboard?: boolean;
}

// 폴더 Sheet open/close 관리
const useFolderSheet = (options: UseFolderSheetOptions) => {
  const { sheetName, parentHandleClose, dismissKeyboard = false } = options;
  const { sheetStack, closeSheet } = activeBottomSheet();
  const isOpen = sheetStack.includes(sheetName);
  const isTopSheet = sheetStack.length > 0 && sheetStack[sheetStack.length - 1] === sheetName;

  const handleClose = useCallback(() => {
    if (dismissKeyboard) Keyboard.dismiss();
    if (parentHandleClose) parentHandleClose();
    closeSheet();
  }, [closeSheet, parentHandleClose, dismissKeyboard]);

  return { isOpen, handleClose, closeSheet, isTopSheet };
};

interface UseFolderSheetWithLoadOptions extends UseFolderSheetOptions {
  loadFolderList: () => Promise<void>;
}

// 폴더 Sheet open/close 관리 및 폴더 목록 새로고침
export const useFolderSheetWithLoad = (options: UseFolderSheetWithLoadOptions) => {
  const { isOpen, handleClose, closeSheet, isTopSheet } = useFolderSheet(options);
  const { loadFolderList } = options;

  useEffect(() => {
    // 최상단 시트일 때만 데이터 로드
    if (isTopSheet) loadFolderList();
  }, [isTopSheet, loadFolderList]);

  return { isOpen, handleClose, closeSheet, isTopSheet };
};
