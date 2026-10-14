export type TFolder = {
  id: number;
  sequence: number;
  name: string;
  created_at: Date;
};

export type TFolderPickerMode = "select" | "add" | "edit";
