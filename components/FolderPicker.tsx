import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import folder from "@table/folders";
import { colors } from "@utils/tailwind-colors";
import { activeBottomSheet } from "@/stores/activeBottomSheet";

import Icon from "./Icon";
import Button from "./Button";
import Typography from "./Typography";
import BottomSheet from "./BottomSheet";
import { InputBox } from "./Input";

import type { TFolder, TFolderPickerMode } from "@/types/folder";
import type { InputBoxHandle } from "./Input/InputBox";

interface IFolderPickerBaseProps {
  initialMode: TFolderPickerMode;
  originalFolder?: TFolder;
  onSelectFolder?: (folder: TFolder) => void;
  handleClose?: () => void;
}

type TFolderPickerSelectProps = IFolderPickerBaseProps & {
  initialMode: "select";
  onSelectFolder: (folder: TFolder) => void;
};

type TFolderPickerAddProps = IFolderPickerBaseProps & {
  initialMode: "add";
};

type TFolderPickerEditProps = IFolderPickerBaseProps & {
  initialMode: "edit";
  originalFolder: TFolder;
};

type TFolderPickerProps = TFolderPickerSelectProps | TFolderPickerAddProps | TFolderPickerEditProps;

const SHEET_NAME = "FOLDER";

const modeList: Record<TFolderPickerMode, string> = {
  "select": "선택",
  "add": "추가",
  "edit": "이름 변경",
};

const FolderPicker = (props: TFolderPickerProps) => {
  const {
    onSelectFolder,
    originalFolder,
    initialMode = "select",
    handleClose: parentHandleClose,
  } = props;

  const [mode, setMode] = useState<TFolderPickerMode>(initialMode);
  const [folderList, setFolderList] = useState<TFolder[]>([]);
  const [folderName, setFolderName] = useState<string>(originalFolder ? originalFolder.name : "");

  const inputRef = useRef<InputBoxHandle>(null);

  const { sheetStack, closeSheet } = activeBottomSheet();
  const isOpen = sheetStack[sheetStack.length - 1] === SHEET_NAME;

  const loadFolderList = useCallback(async () => {
    const folderList = await folder.getAll();
    setFolderList(folderList);
  }, []);

  const validateFolderName = (value: string) => {
    if (!value.trim()) return;

    const isExist = folderList.some(({ name }) => name == value);
    if (isExist) {
      return Alert.alert("같은 폴더는 둘이 될 수 없어요!", undefined, [
        {
          text: "확인",
        },
      ]);
    }

    return true;
  };

  const handleAddFolder = async (value: string) => {
    if (validateFolderName(value)) {
      const res = await folder.create(value);

      if (res) {
        console.log("passsss");

        setFolderName("");
        inputRef.current?.clear();
        handleClose();
      }
    }
  };

  const handleEditFolder = async (value: string) => {
    if (validateFolderName(value) && originalFolder) {
      const res = await folder.update(originalFolder.id, value);
      if (res) {
        handleClose();
      }
    }
  };

  const handleSubmit = async () => {
    const value = inputRef.current?.getValue();

    if (value) {
      if (mode === "add") await handleAddFolder(value);
      else await handleEditFolder(value);
    }
  };

  const handleClose = useCallback(() => {
    if (parentHandleClose) {
      parentHandleClose();
    }
    closeSheet();
  }, [closeSheet, parentHandleClose]);

  useEffect(() => {
    if (isOpen) loadFolderList();
  }, [isOpen, loadFolderList]);

  return (
    <BottomSheet open={isOpen} onClose={closeSheet}>
      <SafeAreaView edges={["bottom"]} className="flex gap-2">
        <View className="relative h-8">
          <View className="left-4 absolute z-10 w-8">
            {initialMode === "select" && mode === "add" && (
              <Pressable
                onPress={() => {
                  setMode("select");
                  if (!!folderName) setFolderName("");
                }}
              >
                <Icon
                  name="chevronLeft"
                  size={24}
                  fill={colors.secondary.dark}
                  stroke={colors.secondary.dark}
                />
              </Pressable>
            )}
          </View>
          <Typography variant="Header3" className="-z-10 absolute left-0 right-0 text-center">
            폴더 {modeList[mode]}
          </Typography>
          <View className="right-4 absolute z-10 w-8">
            {mode === "select" && (
              <Pressable onPress={() => setMode("add")}>
                <Icon
                  name="newFolder"
                  size={24}
                  fill={colors.secondary.dark}
                  stroke={colors.secondary.dark}
                />
              </Pressable>
            )}
          </View>
        </View>
        {mode === "select" ? (
          <FlatList
            data={folderList}
            className="min-h-72 max-h-96"
            contentContainerClassName="flex gap-1"
            keyExtractor={(forder) => `${forder.id}`}
            renderItem={({ item }) => {
              const isDefaultFolder = item.id === 1;

              return (
                <Button
                  size="xl"
                  width="full"
                  variant="text"
                  textAlign="left"
                  bold={isDefaultFolder}
                  color={isDefaultFolder ? "secondary" : "secondary-dark"}
                  className="border-b-hairline border-gray-400"
                  onPress={() => {
                    onSelectFolder && onSelectFolder(item);
                    closeSheet();
                  }}
                >
                  {item.name}
                </Button>
              );
            }}
          />
        ) : (
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
        )}
      </SafeAreaView>
    </BottomSheet>
  );
};

export default FolderPicker;
