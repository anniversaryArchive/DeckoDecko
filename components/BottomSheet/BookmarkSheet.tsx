import { useEffect, useRef, useState } from "react";
import { View, Pressable, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@utils/tailwind-colors";
import { selectImage, saveImage, type ImagePickerAsset } from "@utils/mediaLibraryService";
import { activeBottomSheet } from "@/stores/activeBottomSheet";
import { BOOKMARK_TYPE } from "@/constants/global";
import items from "@table/items";
import folders from "@table/folders";
import getChangedValues from "@utils/getChangedValues";
import useDefaultFolder from "@/hooks/useDefaultFolder";

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
  const [selectedFolder, setSelectFolder] = useState<TFolder | null>(defaultFolder ?? null);
  const [memo, setMemo] = useState<string>("");
  const [isValid, setIsValid] = useState(true);

  // useRef 타입에 null 허용 추가
  const inputRef = useRef<InputBoxHandle | null>(null);

  const { sheetStack, openSheet, closeSheet } = activeBottomSheet();
  const isOpen = sheetStack[sheetStack.length - 1] === SHEET_NAME;
  const label = itemInfo ? "수정" : "추가";

  const pickImage = async () => {
    const uploadImg = await selectImage();
    setImage(uploadImg);
  };

  const handleClose = () => {
    setImage(null);
    setSelectFolder(defaultFolder ?? null);
    setMemo("");
    setIsValid(true);
    setType("WISH");
    inputRef.current?.getValue() && inputRef.current?.clear();
    onClose && onClose();
    closeSheet();
  };

  const handleSubmit = async () => {
    if (itemInfo) {
      // 수정
      const itemName = inputRef.current?.getValue() || itemInfo?.name;
      if (!validate(itemName)) return;

      const assetId = image ? await saveImage(image) : itemInfo.thumbnail;

      const data: TUpdateItemDTO = {
        folder_id: selectedFolder?.id ?? itemInfo.folder_id,
        type,
        name: itemName as string,
        thumbnail: assetId ?? null,
        memo: (memo?.trim() && memo) || null,
      };

      const updateData = getChangedValues(itemInfo, data);

      await items.update(itemInfo.id, updateData);
      handleClose();
    } else {
      // 생성
      const itemName = inputRef.current?.getValue();
      if (!validate(itemName)) return;

      const assetId = image ? await saveImage(image) : null;

      const data: TCreateItemDTO = {
        gacha_id: gachaId,
        folder_id: selectedFolder?.id ?? 0,
        type,
        name: itemName as string,
        thumbnail: assetId ?? null,
        memo: (memo?.trim() && memo) || null,
      };

      await items.create(data);
      handleClose();
    }
  };

  const deleteBookmark = () => {
    if (!itemInfo) return;

    Alert.alert("북마크를 삭제하시겠습니까?", "", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: async () => {
          await items.delete(itemInfo.id);
          handleClose();
        },
      },
    ]);
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

          <Segment<TBookmarkType>
            segments={BOOKMARK_TYPE}
            selectedKey={type}
            onSelect={setType}
          />
          <Pressable
            onPress={pickImage}
            className={`w-[150px] h-[150px] self-center flex items-center justify-center rounded bg-secondary-light `}
          >
            {image ? (
              <Image source={{ uri: image.uri }} className="w-[150px] h-[150px] rounded" />
            ) : itemInfo?.thumbnail ? (
              <LocalImage assetId={itemInfo.thumbnail} width={150} height={150} />
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
            size="lg"
            ref={inputRef}
            defaultValue={itemInfo && itemInfo.name}
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
            {selectedFolder?.name ?? "폴더 선택"}
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
          <View className="flex flex-row gap-2 mt-20">
            <View className="flex-1">
              <Button
                size="xl"
                width="full"
                bold
                rounded
                variant="outlined"
                onPress={deleteBookmark}
              >
                삭제
              </Button>
            </View>
            <View className="flex-1">
              <Button
                size="xl"
                width="full"
                bold
                rounded
                onPress={handleSubmit}
                disabled={!isValid}
              >
                {label}
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheet>
      <FolderPicker initialMode="select" onSelectFolder={setSelectFolder} />
    </>
  );
};

export default BookmarkSheet;
