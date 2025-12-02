import { BOOKMARK_TYPE } from "@/constants/global";
import {TItem} from "@/types/item";
import {TGacha} from "@/types/gacha";

export type TBookmarkType = (typeof BOOKMARK_TYPE)[number]["key"];

export type TItemExtended = TItem & {
  folderName: string;
  gachaInfo: TGacha;
  count?: number;
};
