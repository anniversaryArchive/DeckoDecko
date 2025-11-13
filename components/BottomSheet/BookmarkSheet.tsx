import { useEffect, useRef, useState } from "react";
import { Pressable, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagePickerAsset } from "expo-image-picker";

import { colors } from "@utils/tailwind-colors";
import { selectImage, saveImage } from "@utils/mediaLibraryService";
import getChangedValues from "@utils/getChangedValues";
import { activeBottomSheet } from "@/stores/activeBottomSheet";
import useDefaultFolder from "@/hooks/useDefaultFolder";
import items from "@table/items";
import folders from "@table/folders";
import { BOOKMARK_TYPE } from "@/constants/global";

import { Divider } from "@components/Divider";
import { InputBox, TextBox } from "@components/Input";
import { InputBoxHandle } from "@components/Input/InputBox";
import { LocalImage } from "@components/Image";
import Icon from "@components/Icon";
import Segment from "@components/Segment";
import Typography from "@components/Typography";
import Button from "@components/Button";
import BottomSheet from "./BottomSheet";
import FolderPicker from "./FolderPicker";

import type { TCreateItemDTO, TItem, TUpdateItemDTO } from "@/types/item";
import type { TBookmarkType } from "@/types/bookmark";
import type { TFolder } from "@/types/folder";

interface IBookmarkSheetCommonProps {
  gachaId: number;
  onClose?: () => void;
}

interface IBookmarkSheetProps extends IBookmarkSheetCommonProps {
  itemInfo?: never;
}

interface IBookmarkSheetEditProps extends IBookmarkSheetCommonProps {
  itemInfo: TItem;
}

const SHEET_NAME = "BOOKMARK";

const BookmarkSheet = (props: IBookmarkSheetProps | IBookmarkSheetEditProps) => {
  const { gachaId, onClose, itemInfo } = props;
  const defaultFolder = useDefaultFolder();

  const [type, setType] = useState<TBookmarkType>("WISH");
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [selectedFolder, setSelectFolder] = useState<TFolder>(defaultFolder);
  const [memo, setMemo] = useState<string>("");
  const [isValid, setIsValid] = useState(true);

  const inputRef = useRef<InputBoxHandle>(null);

  const { sheetStack, openSheet, closeSheet } = activeBottomSheet();
  const isOpen = sheetStack[sheetStack.length - 1] === SHEET_NAME;
  const label = itemInfo ? "수정" : "추가";

  const pickImage = async () => {
    const uploadImg = await selectImage();
    setImage(uploadImg);
  };

  const handleClose = () => {
    setImage(null);
    setSelectFolder(defaultFolder);
    setMemo("");
    setIsValid(true);
    setType("WISH");
    !inputRef.current?.getValue() && inputRef.current?.clear();
    onClose && onClose();
    closeSheet();
  };

  const handleSubmit = async () => {
    if (itemInfo) {
      // 수정
      const itemName = inputRef.current?.getValue() ?? itemInfo?.name;
      if (!validate(itemName)) return;

      const assetId = image ? await saveImage(image) : null;

      const data: TUpdateItemDTO = {
        folder_id: selectedFolder.id,
        type,
        name: itemName as string,
        thumbnail: assetId ?? null,
        memo: (memo?.trim() && memo) ?? null,
      };

      const updateData = getChangedValues(itemInfo, data);

      await items.update(itemInfo.id, updateData);
      handleClose();
    } else {
      // 생성
      const itemName = inputRef.current?.getValue();
      if (!validate(itemName)) return;

      const assetId = image ? await saveImage(image) : null;

      // DB 양식 정한게 없는거같아서 필요한 것 같은것만 대강 모아놨습니당
      const data: TCreateItemDTO = {
        gacha_id: gachaId,
        folder_id: selectedFolder.id,
        type,
        name: itemName as string,
        thumbnail: assetId ?? null,
        memo: (memo?.trim() && memo) ?? null,
      };

      await items.create(data);
      handleClose();
    }
  };

  const validate = (itemName?: string) => {
    if (!itemName?.trim()) {
      return Alert.alert("이름은 필수 입력입니다", undefined, [
        {
          text: "확인",
        },
      ]);
    }

    return true;
  };

  const checkDuplicateInSQLite = async (inputText: string) => {
    const isExist = inputText !== itemInfo?.name && !!(await items.getItemByName(inputText));

    if (isExist) {
      setIsValid(false);
    } else if (!isValid) setIsValid(true);
  };

  useEffect(() => {
    const setEditInfo = async (itemInfo: TItem) => {
      setType(itemInfo.type);
      itemInfo.memo && setMemo(itemInfo.memo);
      const originalFolder = await folders.getFolderById(itemInfo.folder_id);
      if (originalFolder) setSelectFolder(originalFolder);
    };

    if (itemInfo) {
      setEditInfo(itemInfo);
    }
  }, [itemInfo]);

  return (
    <>
      <BottomSheet open={isOpen} onClose={handleClose}>
        <SafeAreaView edges={["bottom"]} className="flex justify-center gap-3">
          <Typography variant="header3" className="text-center">
            {label}
          </Typography>

          <Segment segments={BOOKMARK_TYPE} selectedKey={type} onSelect={setType} />
          <Pressable
            onPress={pickImage}
            className={`w-[150px] h-[150px] self-center flex items-center justify-center rounded bg-secondary-light `}
          >
            {image ? (
              // 사용자가 이미지를 선택한 경우 (저장X 선택만 O)
              <Image source={{ uri: image.uri }} className="w-[150px] h-[150px] rounded" />
            ) : itemInfo?.thumbnail ? (
              // 'edit'모드이면서, 사용자가 저장한 썸네일이 있는 경우
              <LocalImage assetId={itemInfo.thumbnail} width={150} height={150} />
            ) : (
              // 선택된 이미지 혹은 'edit' 모드의 경우 저장된 썸네일이 없는 경우
              <Icon
                name="plus"
                size={44}
                fill={colors.secondary.dark}
                stroke={colors.secondary.dark}
              />
            )}
          </Pressable>
          <InputBox
            size="lg"
            ref={inputRef}
            defaultValue={itemInfo?.name}
            onSubmit={handleSubmit}
            onChangeText={checkDuplicateInSQLite}
            placeholder="아이템 이름을 입력해주세요"
            status={isValid ? undefined : "error"}
            errorMsg={"이미 저장된 아이템이에요!"}
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
            defaultValue={memo}
            onChange={(e) => {
              setMemo(e.nativeEvent.text);
            }}
            bold
            placeholder="메모"
            className="min-h-28"
          />
          <Button
            size="xl"
            className="mt-20"
            width="full"
            bold
            rounded
            onPress={handleSubmit}
            disabled={!isValid}
          >
            {label}
          </Button>
        </SafeAreaView>
      </BottomSheet>
      <FolderPicker initialMode="select" onSelectFolder={setSelectFolder} />
    </>
  );
};

export default BookmarkSheet;
