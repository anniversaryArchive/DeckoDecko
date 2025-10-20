import uuid from "react-native-uuid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, TouchableOpacity, View } from "react-native";
import { router, Stack } from "expo-router";

import { activeBottomSheet } from "@/stores/activeBottomSheet";
import { BottomSheet, Button, FolderPicker, Icon, InputBox, Typography } from "@components/index";
import { getColor } from "@utils/color";
import folder from "@table/folders";

import type { TFolder } from "@/types/folder";
import { SafeAreaView } from "react-native-safe-area-context";

const FolderManage = () => {
  const [pickerState, setPickerState] = useState<
    | {
        initialMode: "add";
      }
    | {
        initialMode: "edit";
        originalFolder: TFolder;
      }
  >({
    initialMode: "add",
  });
  const [folderList, setFolderList] = useState<TFolder[]>([]);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteFolder, setDeleteFolder] = useState<TFolder>();

  const { openSheet } = activeBottomSheet();

  const loadFolderList = useCallback(async () => {
    const folderList = await folder.getAll();
    setFolderList(folderList);
  }, []);

  const folderPickerProps = useMemo(() => {
    if (pickerState.initialMode === "edit") {
      return {
        initialMode: "edit" as const,
        originalFolder: pickerState.originalFolder,
      };
    }
    return {
      initialMode: "add" as const,
    };
  }, [pickerState]);

  const handleOpenAddMode = useCallback(() => {
    setPickerState({ initialMode: "add" });
    openSheet("FOLDER");
  }, [openSheet]);

  const handleOpenEditMode = useCallback(
    (folder: TFolder) => {
      setPickerState({ initialMode: "edit", originalFolder: folder });
      openSheet("FOLDER");
    },
    [openSheet]
  );

  useEffect(() => {
    loadFolderList();
  }, [loadFolderList]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "폴더 관리",
          headerShown: true,
          fullScreenGestureShadowEnabled: true,
          headerTitleStyle: { fontFamily: "DunggeunmisoB", color: getColor("primary") },
          headerLeft: () => (
            <TouchableOpacity className="ml-1.5" onPress={() => router.back()}>
              <Icon name="back" size={24} fill={getColor("primary")} stroke={getColor("primary")} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <Pressable className="mr-1.5" onPress={() => handleOpenAddMode()}>
              <Icon
                name="newFolder"
                size={24}
                fill={getColor("primary")}
                stroke={getColor("primary")}
              />
            </Pressable>
          ),
        }}
      />
      <View className="p-6">
        <FlatList
          data={folderList}
          className="min-h-72"
          contentContainerClassName="flex gap-3 flex-grow"
          keyExtractor={(forder) => `${forder.id}`}
          renderItem={({ item }) => {
            const isDefaultFolder = item.id === 1;

            return (
              <View className="flex-row items-center justify-between gap-3">
                <TouchableOpacity
                  disabled={isDefaultFolder}
                  onPress={() => {
                    setDeleteFolder(item);
                    setIsDelete(true);
                  }}
                >
                  <Icon
                    name="minus"
                    size={24}
                    fill={"none"}
                    stroke={isDefaultFolder ? "gray-04" : "#ff000080"}
                    strokeWidth={4}
                  />
                </TouchableOpacity>
                <InputBox
                  size="md"
                  className="grow"
                  value={item.name}
                  editable={false}
                  readOnly={isDefaultFolder}
                  onPress={() => {
                    if (!isDefaultFolder) handleOpenEditMode(item);
                  }}
                />
              </View>
            );
          }}
        />
      </View>
      <FolderPicker
        key={
          pickerState.initialMode === "edit"
            ? `edit-${pickerState.originalFolder?.id}`
            : `${pickerState.initialMode}-${uuid.v4()}`
        }
        handleClose={async () => {
          await loadFolderList();
        }}
        {...folderPickerProps}
      />
      <BottomSheet open={isDelete} onClose={() => setIsDelete(false)}>
        <SafeAreaView edges={["bottom"]} className="flex justify-between gap-12">
          <View className="items-center justify-center gap-3">
            <Typography variant="Header2">폴더 삭제</Typography>
            <Typography>
              {deleteFolder ? `"${deleteFolder.name}"` : ""} 폴더 내 모든 아이템도 함께 삭제됩니다.
            </Typography>
            <Typography>정말 삭제하시겠습니까?</Typography>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <Button
              layout="flex"
              width="full"
              size="xl"
              variant="outlined"
              bold
              rounded
              onPress={() => {
                setIsDelete(false);
              }}
            >
              취소
            </Button>
            <Button
              layout="flex"
              width="full"
              size="xl"
              bold
              rounded
              onPress={async () => {
                if (deleteFolder) {
                  await folder.delete(deleteFolder.id);
                  await loadFolderList();
                  setIsDelete(false);
                }
              }}
            >
              삭제
            </Button>
          </View>
        </SafeAreaView>
      </BottomSheet>
    </>
  );
};

export default FolderManage;
