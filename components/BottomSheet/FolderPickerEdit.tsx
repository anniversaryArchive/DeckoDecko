import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Keyboard, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import folder from "@table/folders";
import { activeBottomSheet } from "@/stores/activeBottomSheet";

import { InputBox } from "@components/Input";
import Typography from "@components/Typography";
import Button from "@components/Button";
import BottomSheet from "./BottomSheet";

import type { TFolder } from "@/types/folder";
import type { InputBoxHandle } from "../Input/InputBox";

interface IFolderPickerEditProps {
  originalFolder: TFolder;
  handleClose?: () => void;
}

const SHEET_NAME = "FOLDER_EDIT";

const FolderPickerEdit = ({
  originalFolder,
  handleClose: parentHandleClose,
}: IFolderPickerEditProps) => {
  const [folderList, setFolderList] = useState<TFolder[]>([]);
  const [folderName] = useState<string>(originalFolder.name);
  const inputRef = useRef<InputBoxHandle>(null);

  const { sheetStack, closeSheet } = activeBottomSheet();
  const isOpen = sheetStack[sheetStack.length - 1] === SHEET_NAME;

  const loadFolderList = useCallback(async () => {
    try {
      const folderList = await folder.getAll();
      setFolderList(folderList);
    } catch (error) {
      console.error("[ERROR] FolderPickerEdit loadFolderList : ", error);
    }
  }, []);

  const validateFolderName = (value: string) => {
    if (!value.trim()) return;

    // 현재 폴더 이름과 같으면 통과
    if (value === originalFolder.name) {
      return true;
    }

    const isExist = folderList.some(({ name }) => name === value);
    if (isExist) {
      return Alert.alert("같은 폴더는 둘이 될 수 없어요!", undefined, [
        {
          text: "확인",
        },
      ]);
    }

    return true;
  };

  const handleEditFolder = async (value: string) => {
    if (validateFolderName(value)) {
      const res = await folder.update(originalFolder.id, value);
      if (res) {
        handleClose();
      }
    }
  };

  const handleSubmit = async () => {
    const value = inputRef.current?.getValue();

    if (value) {
      await handleEditFolder(value);
    }
  };

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    if (parentHandleClose) {
      parentHandleClose();
    }
    closeSheet();
  }, [closeSheet, parentHandleClose]);

  useEffect(() => {
    if (isOpen) {
      loadFolderList();
    }
  }, [isOpen, loadFolderList]);

  return (
    <BottomSheet open={isOpen} onClose={handleClose}>
      <SafeAreaView edges={["bottom"]} className="flex gap-2">
        <View className="relative h-8">
          <Typography variant="header3" className="absolute left-0 right-0 text-center">
            폴더 이름 변경
          </Typography>
        </View>
        <View className="flex justify-between gap-12">
          <InputBox
            size="lg"
            ref={inputRef}
            defaultValue={folderName}
            onSubmit={handleSubmit}
            placeholder="폴더명을 입력해주세요."
          />
          <Button size="xl" width="full" bold rounded onPress={handleSubmit}>
            {"확인"}
          </Button>
        </View>
      </SafeAreaView>
    </BottomSheet>
  );
};

export default FolderPickerEdit;
