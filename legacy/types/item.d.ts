import { BOOKMARK_TYPE } from "@/constants/global";
import { TFolder } from "./folder";
import { TBookmarkType } from "./bookmark";

export type TItem = {
  id: number;
  gacha_id: number; // TODO: 추후 gacha 타입 생기면 변경
  folder_id: TFolder["id"];
  type: TBookmarkType;
  name: string;
  thumbnail: string | null;
  memo: string | null;
  created_at: Date;
  updated_at: Date;
};

export type TCreateItemDTO = Pick<
  TItem,
  "gacha_id" | "name" | "folder_id" | "thumbnail" | "memo" | "type"
>;

export type TUpdateItemDTO = Partial<Omit<TCreateItemDTO, "gacha_id">>;
