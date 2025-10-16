import { useCallback, useEffect, useState } from "react";
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

import { TFolder } from "@/types/folder";

interface IFolderPickerProps {
  onSelectFolder: (folder: TFolder) => void;
}

const SHEET_NAME = "FOLDER";

const FolderPicker = (props: IFolderPickerProps) => {
  const { onSelectFolder } = props;
  const [mode, setMode] = useState<"select" | "add">("select");
  const [folderList, setFolderList] = useState<TFolder[]>([]);
  const [folderName, setFolderName] = useState("");

  const { sheetStack, closeSheet } = activeBottomSheet();
  const isOpen = sheetStack[sheetStack.length - 1] === SHEET_NAME;

  const loadFolderList = useCallback(async () => {
    const folderList = await folder.getAll();
    setFolderList(folderList);
  }, []);

  const handleAddFolder = useCallback(
    async (value: string) => {
      if (!value.trim()) return;

      const isExist = folderList.some(({ name }) => name == value);
      if (isExist) {
        return Alert.alert("같은 폴더는 둘이 될 수 없어요!", undefined, [
          {
            text: "확인",
          },
        ]);
      }

      const res = await folder.create(value);
      if (res) {
        await loadFolderList();
        setMode("select");
        setFolderName("");
      }
    },
    [folderList, loadFolderList]
  );

  useEffect(() => {
    isOpen && loadFolderList();
  }, [isOpen]);

  return (
    <BottomSheet open={isOpen} onClose={closeSheet}>
      <SafeAreaView edges={["bottom"]} className="flex gap-2">
        <View className="relative h-8">
          <View className="left-4 absolute z-10 w-8">
            {mode === "add" && (
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
          <Typography variant="header3" className="-z-10 absolute left-0 right-0 text-center">
            {mode === "select" ? "폴더 선택" : "폴더 추가"}
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
                  className="border-b-hairline border-gray-400" // 추후 Divider component로 변경
                  onPress={() => {
                    onSelectFolder(item);
                    closeSheet();
                  }}
                >
                  {item.name}
                </Button>
              );
            }}
          />
        ) : (
          <View className="flex justify-between gap-20">
            <InputBox
              size="lg"
              value={folderName}
              onChangeText={setFolderName}
              onSubmit={handleAddFolder}
              placeholder="폴더명을 입력해주세요."
            />
            <Button
              size="xl"
              width="full"
              bold
              rounded
              onPress={() => {
                handleAddFolder(folderName);
              }}
            >
              생성
            </Button>
          </View>
        )}
      </SafeAreaView>
    </BottomSheet>
  );
};

export default FolderPicker;
