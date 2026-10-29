/**
 * @deckodecko/core — 데이터 계층.
 *   이 엔트리(".")   : React 없음. 도메인 타입, repository 인터페이스 · 구현, 쿼리 키.
 *                      Next.js 서버 컴포넌트 · 스크립트에서 import 해도 된다.
 *   "./react"        : CoreProvider 와 훅. 클라이언트 컴포넌트에서만 import 한다.
 *   "./mocks"        : 개발 · 테스트용 목 데이터.
 * 화면은 repository 와 훅만 쓴다. Supabase 는 클라이언트를 만드는 함수만 내보내고(앱 · 백오피스의 저장소 조립용),
 * 만든 클라이언트 인스턴스는 저장소에만 넘긴다.
 */
export type {
  Folder,
  Gacha,
  GachaDetail,
  GachaItem,
  GoodsViewMode,
  Item,
  ItemCounts,
  ItemType,
  Media,
  MediaKind,
  Notice,
  Page,
} from "./types";
export type { ListNoticesParams, NoticeRepository } from "./repositories/notice";
export { NOTICE_DEFAULTS } from "./repositories/notice";
export { createMemoryNoticeRepository } from "./repositories/notice.memory";
export type {
  GachaFilter,
  GachaReleaseFilter,
  GachaRepository,
  GachaSort,
  ListGachaParams,
  ReleaseStatus,
  ResolvedGachaFilter,
  SearchGachaParams,
} from "./repositories/gacha";
export {
  GACHA_DEFAULTS,
  releaseStatus,
  resolveGachaFilter,
  toYearMonth,
} from "./repositories/gacha";
export type {
  CreateItemInput,
  ItemNameQuery,
  ItemRepository,
  ListItemsParams,
  UpdateItemInput,
} from "./repositories/items";
export type { FolderRepository } from "./repositories/folders";
export type { LocalRepositories, Repositories } from "./repositories";
export { cleanName, normalizeName } from "./name";
export { createMemoryLocalRepositories } from "./repositories/local.memory";
export { collectionRate, gachaCollection, type GachaCollection } from "./collection";
export { createMemoryGachaRepository } from "./repositories/gacha.memory";
export type { RecentRepository } from "./repositories/recent";
export {
  RECENT_LIMIT,
  normalizeKeyword,
  truncateKeyword,
  parseRecent,
  pushRecent,
  removeRecent,
} from "./repositories/recent";
export type { KeyValueStorage } from "./repositories/recent.storage";
export {
  createMemoryKeyValueStorage,
  createStorageRecentRepository,
} from "./repositories/recent.storage";
export type { PreferencesRepository } from "./repositories/preferences";
export { DEFAULT_GOODS_VIEW_MODE, parseGoodsViewMode } from "./repositories/preferences";
export { createStoragePreferencesRepository } from "./repositories/preferences.storage";
export { createSupabaseGachaRepository } from "./repositories/gacha.supabase";
export { createSupabaseClient, type DeckoSupabaseClient } from "./supabase";
export { queryKeys } from "./queryKeys";
export { storageKeys, type StorageKey } from "./storageKeys";
