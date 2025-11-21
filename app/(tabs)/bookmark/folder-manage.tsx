import uuid from "react-native-uuid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { activeBottomSheet } from "@/stores/activeBottomSheet";
import { BottomSheet, Button, FolderPicker, Icon, InputBox, Typography } from "@components/index";
import { getColor } from "@utils/color";
import folder from "@table/folders";

import type { TFolder } from "@/types/folder";

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
  const [listResetKey, setListResetKey] = useState(0); // 리스트 강제 리셋하기 위한 값
  const [isDelete, setIsDelete] = useState(false);
  const [deleteFolder, setDeleteFolder] = useState<TFolder>();

  const { openSheet } = activeBottomSheet();

  const loadFolderList = useCallback(async () => {
    const folderList = await folder.getAll();
    const exceptInitialFolder = folderList.filter((f) => f.id !== 1);
    setFolderList(exceptInitialFolder);
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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<TFolder>) => {
    const isLastFolder = item.sequence === folderList.length;

    return (
      <ScaleDecorator>
        <View
          className={`flex-row items-center justify-between gap-3 ${isLastFolder ? "mb-3" : ""}`}
        >
          <TouchableOpacity
            className="items-center justify-center"
            onPress={() => {
              setDeleteFolder(item);
              setIsDelete(true);
            }}
          >
            <Icon name="minus" size={24} fill={"none"} stroke={"#ff000080"} strokeWidth={4} />
          </TouchableOpacity>
          <InputBox
            size="md"
            className="grow"
            value={item.name}
            editable={false}
            onPress={() => {
              handleOpenEditMode(item);
            }}
          />
          <TouchableOpacity
            className="items-center justify-center"
            disabled={isActive}
            onLongPress={drag}
          >
            <Icon name="menu" size={24} fill={"none"} stroke={"gray-04"} strokeWidth={4} />
          </TouchableOpacity>
        </View>
      </ScaleDecorator>
    );
  };

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
      <DraggableFlatList
        key={listResetKey}
        data={folderList}
        keyExtractor={(forder) => `${forder.id}`}
        className="h-full px-6 py-4"
        contentContainerClassName="gap-3"
        onDragEnd={async ({ data, from, to }) => {
          const newFolderList = data.map((v, index) => {
            return { ...v, sequence: index + 1 };
          });
          setFolderList(newFolderList);

          if (from !== to) {
            // 순서가 변경되었을 경우만 DB 업데이트
            await folder.updateSequence(newFolderList);
          } else {
            setListResetKey((prevKey) => prevKey + 1);
          }
        }}
        renderItem={renderItem}
      />
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
          <View className="items-center justify-center gap-6">
            <Typography variant="header2">폴더 삭제</Typography>
            <View className="items-center justify-center gap-3">
              <Typography>
                {deleteFolder ? `"${deleteFolder.name}"` : ""} 폴더 내 모든 아이템도 함께
                삭제됩니다.
              </Typography>
              <Typography>정말 삭제하시겠습니까?</Typography>
            </View>
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
                  setListResetKey((prevKey) => prevKey + 1);
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
