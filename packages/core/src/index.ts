/**
 * @deckodecko/core — 데이터 계층.
 *   이 엔트리(".")   : React 없음. 도메인 타입, repository 인터페이스 · 구현, 쿼리 키.
 *                      Next.js 서버 컴포넌트 · 스크립트에서 import 해도 된다.
 *   "./react"        : CoreProvider 와 훅. 클라이언트 컴포넌트에서만 import 한다.
 *   "./mocks"        : 개발 · 테스트용 목 데이터.
 * 화면은 repository 와 훅만 쓴다. Supabase 클라이언트(2주차)는 여기서 export 하지 않는다.
 */
export type {
  Folder,
  Gacha,
  GachaDetail,
  GachaItem,
  Item,
  ItemCounts,
  ItemType,
  Media,
  MediaKind,
  Page,
} from "./types";
export type { GachaRepository, ListGachaParams, SearchGachaParams } from "./repositories/gacha";
export { GACHA_DEFAULTS } from "./repositories/gacha";
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
export { queryKeys } from "./queryKeys";
