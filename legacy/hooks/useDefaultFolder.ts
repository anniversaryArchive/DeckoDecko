import { defaultFolderState } from "@/stores/defaultFolderState";
import type { TFolder } from "@/types/folder";

export default function useDefaultFolder() {
  return defaultFolderState((state) => state.folder) as TFolder;
}
