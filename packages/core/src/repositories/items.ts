import type { Item, ItemCounts, ItemType } from "../types";

/** 조건은 모두 AND. 생략한 조건은 거르지 않는다. */
export type ListItemsParams = {
  gachaId?: string;
  type?: ItemType;
  folderId?: string;
};

export type CreateItemInput = {
  gachaId: string;
  type: ItemType;
  name: string;
  folderId?: string; // 생략하면 기본 폴더
  thumbnail?: string | null;
  memo?: string | null;
};

export type UpdateItemInput = Partial<
  Pick<Item, "type" | "name" | "folderId" | "thumbnail" | "memo">
>;

export type ItemNameQuery = {
  gachaId: string;
  name: string;
  excludeId?: string; // 수정 중인 기록 자신은 빼고 본다
};

/**
 * 기기 로컬 WISH / GET 기록. 구현은 앱(apps/mobile/lib/db)에 있고 lib/repositories.ts 에서 주입한다 (ADR 0002).
 * 쓰기가 실패하면 에러를 그대로 던진다. 화면은 mutation 의 error 로 받는다.
 */
export interface ItemRepository {
  /** 최근에 추가한 것부터 */
  listItems(params?: ListItemsParams): Promise<Item[]>;
  getItem(id: string): Promise<Item | null>;
  countItems(params?: { gachaId?: string }): Promise<ItemCounts>;
  /** 폴더 id → 기록 수 (WISH · GET 합). 기록이 없는 폴더는 빠진다 */
  countItemsByFolder(): Promise<Record<string, number>>;
  createItem(input: CreateItemInput): Promise<Item>;
  /** 없는 id 면 던진다. WISH ↔ GET 전환도 이것으로 한다 ({ type }) */
  updateItem(id: string, input: UpdateItemInput): Promise<Item>;
  /** 없는 id 면 아무 일도 하지 않는다 */
  deleteItem(id: string): Promise<void>;
  /** 같은 가챠 안에서만 검사한다. 비교 기준은 normalizeName */
  isItemNameTaken(query: ItemNameQuery): Promise<boolean>;
}
