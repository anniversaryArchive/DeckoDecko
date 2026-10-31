"use client";

/**
 * @deckodecko/core/react — Provider 와 훅. 클라이언트 컴포넌트 전용.
 * 훅은 도메인별 <도메인>.hooks.ts 에 두고 여기서 모아 export 한다.
 */
export { CoreProvider, useLocalRepositories, useRepositories } from "./provider";
export { createQueryClient } from "./queryClient";
export { setOnlineListener, useIsOnline } from "./network";
export {
  useGacha,
  useGachaList,
  useGachaSearchPages,
  useGachasByIds,
  usePopularGacha,
} from "./gacha.hooks";
export { useHomeNotices, useNotice, useNotices } from "./notice.hooks";
export {
  useCreateItem,
  useDeleteItem,
  useDisplayedItemType,
  useIsItemNameTaken,
  useItem,
  useItemCounts,
  useItemCountsByFolder,
  useItems,
  useReadDisplayedItemType,
  useSetItemType,
  useToggleItemType,
  useUpdateItem,
} from "./items.hooks";
export {
  useCreateFolder,
  useDeleteFolder,
  useFolders,
  useIsFolderNameTaken,
  useRenameFolder,
} from "./folders.hooks";
export {
  useAddRecentSearch,
  useClearRecentGacha,
  useClearRecentSearches,
  useRecentGacha,
  useRecentSearches,
  useRecordRecentGacha,
  useRemoveRecentSearch,
} from "./recent.hooks";
export { useGoodsViewMode, useSetGoodsViewMode } from "./preferences.hooks";
