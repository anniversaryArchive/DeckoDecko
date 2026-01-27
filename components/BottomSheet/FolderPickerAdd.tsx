import { useRef } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import folder from "@table/folders";
import { colors } from "@utils/tailwind-colors";

import Icon from "@components/Icon";
import { InputBox } from "@components/Input";
import Typography from "@components/Typography";
import Button from "@components/Button";
import BottomSheet from "./BottomSheet";
import { useFolderList, useFolderValidation, useFolderSheetWithLoad } from "./useFolderPicker";

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
  const inputRef = useRef<InputBoxHandle>(null);
  const { folderList, loadFolderList } = useFolderList();
  const { validateFolderName } = useFolderValidation(folderList);
  const { isOpen, handleClose, closeSheet, isTopSheet } = useFolderSheetWithLoad({
    sheetName: SHEET_NAME,
    parentHandleClose,
    dismissKeyboard: true,
    loadFolderList,
  });

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

  const handleBack = () => {
    Keyboard.dismiss();
    closeSheet();
  };

  return (
    <BottomSheet open={isOpen} onClose={handleClose} isTopSheet={isTopSheet}>
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
