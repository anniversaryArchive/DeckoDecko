import { useCallback, useState } from "react";
import { Pressable, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagePickerAsset } from "expo-image-picker";

import { colors } from "@utils/tailwind-colors";
import { selectImage, saveImage } from "@utils/mediaLibraryService";
import { activeBottomSheet } from "@/stores/activeBottomSheet";
import { BOOKMARK_TYPE } from "@/constants/global";
import useDefaultFolder from "@/hooks/useDefaultFolder";
import items from "@table/items";

import Icon from "./Icon";
import Button from "./Button";
import BottomSheet from "./BottomSheet";
import Divider from "./Divider";
import FolderPicker from "./FolderPicker";
import { InputBox, TextBox } from "./Input";
import Segment from "./Segment";
import Typography from "./Typography";

import { TCreateItemDTO } from "@/types/item";
import { TBookmarkType } from "@/types/bookmark";
import { TFolder } from "@/types/folder";

interface IBookmarkSheetProps {
  gachaId: number;
}

const SHEET_NAME = "BOOKMARK";

const BookmarkSheet = (props: IBookmarkSheetProps) => {
  const { gachaId } = props;
  const defaultFolder = useDefaultFolder();

  const [type, setType] = useState<TBookmarkType>("WISH");
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [itemName, setItemName] = useState("");
  const [selectedFolder, setSelectFolder] = useState<TFolder>(defaultFolder);
  const [memo, setMemo] = useState<string | null>(null);

  const { sheetStack, openSheet, closeSheet } = activeBottomSheet();
  const isOpen = sheetStack[sheetStack.length - 1] === SHEET_NAME;

  const pickImage = async () => {
    const uploadImg = await selectImage();
    setImage(uploadImg);
  };

  const handleClose = useCallback(() => {
    setImage(null);
    setItemName("");
    setSelectFolder(defaultFolder);
    setMemo("");
    closeSheet();
  }, []);

  const handleSubmit = async () => {
    if (!validate()) return;

    const assetId = image ? await saveImage(image) : null;

    // DB 양식 정한게 없는거같아서 필요한 것 같은것만 대강 모아놨습니당
    const data: TCreateItemDTO = {
      gacha_id: gachaId,
      folder_id: selectedFolder.id,
      type,
      name: itemName,
      thumbnail: assetId ?? null,
      memo: (memo?.trim() && memo) ?? null,
    };

    await items.create(data);
    handleClose();
  };

  const validate = () => {
    if (!itemName.trim()) {
      return Alert.alert("이름은 필수 입력입니다", undefined, [
        {
          text: "확인",
        },
      ]);
    }

    return true;
  };

  return (
    <>
      <BottomSheet open={isOpen} onClose={handleClose}>
        <SafeAreaView edges={["bottom"]} className="flex justify-center gap-3">
          <Typography variant="Header3" className="text-center">
            추가
          </Typography>
          <Segment segments={BOOKMARK_TYPE} selectedKey={type} onSelect={setType} />
          <Pressable
            onPress={pickImage}
            className={`w-[150px] h-[150px] self-center flex items-center justify-center rounded bg-secondary-light `}
          >
            {image ? (
              <Image source={{ uri: image.uri }} className="w-[150px] h-[150px] rounded" />
            ) : (
              <Icon
                name="plus"
                size={44}
                fill={colors.secondary.dark}
                stroke={colors.secondary.dark}
              />
            )}
          </Pressable>
          <InputBox
            value={itemName}
            onChangeText={setItemName}
            size="lg"
            placeholder="이름을 입력해주세요"
          />
          <Divider />
          <Button
            bold
            size="lg"
            width="full"
            variant="text"
            color="secondary-dark"
            textAlign="left"
            contentClassName="gap-2"
            startIcon={
              <Icon
                name="folderFill"
                size={24}
                fill={colors.secondary.dark}
                stroke={colors.secondary.dark}
              />
            }
            endIcon={
              <Icon
                name="chevronRight"
                size={24}
                fill={colors.secondary.dark}
                stroke={colors.secondary.dark}
              />
            }
            onPress={() => {
              openSheet("FOLDER");
            }}
          >
            {selectedFolder.name}
          </Button>
          <Divider />
          <TextBox
            value={memo}
            onChangeText={setMemo}
            bold
            placeholder="메모"
            className="min-h-28"
          />
          <Button size="xl" className="mt-20" width="full" rounded bold onPress={handleSubmit}>
            추가
          </Button>
        </SafeAreaView>
      </BottomSheet>
      <FolderPicker onSelectFolder={setSelectFolder} />
    </>
  );
};

export default BookmarkSheet;
