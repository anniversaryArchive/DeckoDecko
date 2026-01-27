import { useRef, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import folder from "@table/folders";

import { InputBox } from "@components/Input";
import Typography from "@components/Typography";
import Button from "@components/Button";
import BottomSheet from "./BottomSheet";
import { useFolderList, useFolderValidation, useFolderSheetWithLoad } from "./useFolderPicker";

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
  const [folderName] = useState<string>(originalFolder.name);
  const inputRef = useRef<InputBoxHandle>(null);
  const { folderList, loadFolderList } = useFolderList();
  const { validateFolderName } = useFolderValidation(folderList, {
    excludeFolderName: originalFolder.name,
  });
  const { isOpen, handleClose, isTopSheet } = useFolderSheetWithLoad({
    sheetName: SHEET_NAME,
    parentHandleClose,
    dismissKeyboard: true,
    loadFolderList,
  });

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

  return (
    <BottomSheet open={isOpen} onClose={handleClose} isTopSheet={isTopSheet}>
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
