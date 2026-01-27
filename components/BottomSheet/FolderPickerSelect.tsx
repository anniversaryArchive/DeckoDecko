import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { activeBottomSheet } from "@/stores/activeBottomSheet";
import { colors } from "@utils/tailwind-colors";

import Icon from "@components/Icon";
import Typography from "@components/Typography";
import Button from "@components/Button";
import BottomSheet from "./BottomSheet";
import { Spinner } from "@/components/Spinner";
import { useFolderList, useFolderSheetWithLoad } from "./useFolderPicker";

import type { TFolder } from "@/types/folder";

interface IFolderPickerSelectProps {
  onSelectFolder: (folder: TFolder) => void;
  handleClose?: () => void;
}

const SHEET_NAME = "FOLDER_SELECT";

const FolderPickerSelect = ({
  onSelectFolder,
  handleClose: parentHandleClose,
}: IFolderPickerSelectProps) => {
  const { folderList, loading, loadFolderList } = useFolderList({ withLoading: true });
  const { isOpen, handleClose, isTopSheet } = useFolderSheetWithLoad({
    sheetName: SHEET_NAME,
    parentHandleClose,
    loadFolderList,
  });
  const { openSheet } = activeBottomSheet();
  const [prevSheetStack, setPrevSheetStack] = useState<string[]>([]);
  const { sheetStack } = activeBottomSheet();

  const handleOpenAdd = useCallback(() => {
    openSheet("FOLDER_ADD");
  }, [openSheet]);

  // FOLDER_ADD가 닫혔을 때 (이전에 FOLDER_ADD가 있었는데 지금은 없을 때) 리스트 새로고침
  useEffect(() => {
    const wasAddSheetOpen = prevSheetStack.includes("FOLDER_ADD");
    const isAddSheetOpen = sheetStack.includes("FOLDER_ADD");

    if (wasAddSheetOpen && !isAddSheetOpen && isOpen) {
      loadFolderList();
    }

    setPrevSheetStack(sheetStack);
  }, [sheetStack, isOpen, prevSheetStack, loadFolderList]);

  return (
    <BottomSheet open={isOpen} onClose={handleClose} isTopSheet={isTopSheet}>
      <Spinner visible={loading} />
      <SafeAreaView edges={["bottom"]} className="flex gap-2">
        <View className="relative h-8">
          <Typography variant="header3" className="absolute left-0 right-0 text-center">
            폴더 선택
          </Typography>
          <View className="right-4 absolute z-10 w-8">
            <Pressable onPress={handleOpenAdd}>
              <Icon
                name="newFolder"
                size={24}
                fill={colors.secondary.dark}
                stroke={colors.secondary.dark}
              />
            </Pressable>
          </View>
        </View>
        <FlatList
          data={folderList}
          className="min-h-72 max-h-96"
          contentContainerClassName="flex gap-1"
          keyExtractor={(folder) => `${folder.id}`}
          renderItem={({ item }) => (
            <Button
              size="xl"
              width="full"
              variant="text"
              textAlign="left"
              color={"secondary-dark"}
              className="border-b-hairline border-gray-400"
              onPress={() => {
                onSelectFolder(item);
                handleClose();
              }}
            >
              {item.name}
            </Button>
          )}
        />
      </SafeAreaView>
    </BottomSheet>
  );
};

export default FolderPickerSelect;
