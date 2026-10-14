/**
 * @deckodecko/core — 데이터 계층.
 *   이 엔트리(".")   : React 없음. Supabase 클라이언트, 도메인 타입, repository 인터페이스 · 구현, 쿼리 키.
 *                      Next.js 서버 컴포넌트 · 스크립트에서 import 해도 된다.
 *   "./react"        : CoreProvider 와 훅. 클라이언트 컴포넌트에서만 import 한다.
 * Supabase 클라이언트 인스턴스는 export 하지 않는다. 화면은 repository 와 훅만 쓴다.
 */
export { createSupabaseClient } from "./supabase";
export type { DbClient } from "./supabase";
export type { Database, Json } from "./database.types";
export type { Gacha, GachaDetail, GachaItem, Media, MediaKind, Page } from "./types";
export type {
  GachaRepository,
  ListGachaParams,
  Repositories,
  SearchGachaParams,
} from "./repositories/gacha";
export { createMemoryGachaRepository } from "./repositories/memory";
export { queryKeys } from "./queryKeys";
