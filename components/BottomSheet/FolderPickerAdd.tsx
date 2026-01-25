import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Keyboard, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import folder from "@table/folders";
import { activeBottomSheet } from "@/stores/activeBottomSheet";
import { colors } from "@utils/tailwind-colors";

import Icon from "@components/Icon";
import { InputBox } from "@components/Input";
import Typography from "@components/Typography";
import Button from "@components/Button";
import BottomSheet from "./BottomSheet";

import type { TFolder } from "@/types/folder";
import type { InputBoxHandle } from "../Input/InputBox";

interface IFolderPickerAddProps {
  handleClose?: () => void;
  onAddComplete?: () => void;
}

const SHEET_NAME = "FOLDER_ADD";

const FolderPickerAdd = ({
  handleClose: parentHandleClose,
  onAddComplete,
}: IFolderPickerAddProps) => {
  const [folderList, setFolderList] = useState<TFolder[]>([]);
  const inputRef = useRef<InputBoxHandle>(null);

  const { sheetStack, closeSheet } = activeBottomSheet();
  const isOpen = sheetStack[sheetStack.length - 1] === SHEET_NAME;

  const loadFolderList = useCallback(async () => {
    try {
      const folderList = await folder.getAll();
      setFolderList(folderList);
    } catch (error) {
      console.error("[ERROR] FolderPickerAdd loadFolderList : ", error);
    }
  }, []);

  const validateFolderName = (value: string) => {
    if (!value.trim()) return;

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

  const handleAddFolder = async (value: string, sequence: number) => {
    if (validateFolderName(value)) {
      const res = await folder.create(value, sequence);

      if (res) {
        inputRef.current?.clear();
        // FOLDER_ADD 시트를 닫으면 자동으로 FOLDER_SELECT가 다시 보임
        closeSheet();
        if (onAddComplete) onAddComplete();
        if (parentHandleClose) parentHandleClose();
      }
    }
  };

  const handleSubmit = async () => {
    const value = inputRef.current?.getValue();

    if (value) {
      await handleAddFolder(value, folderList.length);
    }
  };

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    closeSheet();
    if (parentHandleClose) {
      parentHandleClose();
    }
  }, [closeSheet, parentHandleClose]);

  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    closeSheet();
  }, [closeSheet]);

  useEffect(() => {
    if (isOpen) {
      loadFolderList();
    }
  }, [isOpen, loadFolderList]);

  return (
    <BottomSheet open={isOpen} onClose={handleClose}>
      <SafeAreaView edges={["bottom"]} className="flex gap-2">
        <View className="relative h-8">
          <View className="left-4 absolute z-10 w-8">
            <Pressable onPress={handleBack}>
              <Icon
                name="chevronLeft"
                size={24}
                fill={colors.secondary.dark}
                stroke={colors.secondary.dark}
              />
            </Pressable>
          </View>
          <Typography variant="header3" className="-z-10 absolute left-0 right-0 text-center">
            폴더 추가
          </Typography>
        </View>
        <View className="flex justify-between gap-12">
          <InputBox
            size="lg"
            ref={inputRef}
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

export default FolderPickerAdd;
