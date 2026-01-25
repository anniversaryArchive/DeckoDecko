import { useEffect } from "react";
import { activeBottomSheet } from "@/stores/activeBottomSheet";

import FolderPickerSelect from "./FolderPickerSelect";
import FolderPickerAdd from "./FolderPickerAdd";
import FolderPickerEdit from "./FolderPickerEdit";

import type { TFolder, TFolderPickerMode } from "@/types/folder";

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

const FolderPicker = (props: TFolderPickerProps) => {
  const { initialMode, onSelectFolder, originalFolder, handleClose } = props;
  const { openSheet } = activeBottomSheet();

  useEffect(() => {
    // 'select'는 외부에서 호출
    if (["add", "edit"].includes(initialMode))
      openSheet(`FOLDER_${initialMode.toUpperCase() as "ADD" | "EDIT"}`);
  }, [initialMode, openSheet]);

  if (initialMode === "select")
    return (
      <>
        <FolderPickerSelect onSelectFolder={onSelectFolder!} handleClose={handleClose} />
        <FolderPickerAdd handleClose={handleClose} />
      </>
    );
  if (initialMode === "add") return <FolderPickerAdd handleClose={handleClose} />;
  if (initialMode === "edit" && originalFolder)
    return <FolderPickerEdit originalFolder={originalFolder} handleClose={handleClose} />;

  return null;
};

export default FolderPicker;
