import { readFile, writeFile } from "node:fs/promises";

/** 수집 결과. 리뷰는 이 JSON 으로 하고, SQL 은 여기서 다시 만든다. */
export interface CatalogFile {
  source: string;
  collectedAt: string;
  entries: CatalogEntry[];
}

export interface CatalogEntry {
  /** 이미 dev 에 있는 레거시 gacha.id */
  gachaId: number;
  animeId: number;
  /** 리뷰용. SQL 에는 쓰지 않는다. */
  animeTitle: string;
  name: string;
  nameKr: string | null;
  sourceUrl: string;
  /** "YYYY-MM" */
  releaseMonth: string;
  price: number;
  items: CatalogItem[];
}

export interface CatalogItem {
  name: string;
  /** 번역 전이면 null. Claude Code 세션에서 JSON 을 직접 채운다 (README). */
  nameKr: string | null;
  imageLink: string;
}

export const CATALOG_JSON = new URL("../../../supabase/catalog/legacy-60.json", import.meta.url);
export const CATALOG_SQL = new URL("../../../supabase/catalog/legacy-60.sql", import.meta.url);

export async function readCatalog(): Promise<CatalogFile> {
  return JSON.parse(await readFile(CATALOG_JSON, "utf8")) as CatalogFile;
}

export async function writeCatalog(catalog: CatalogFile): Promise<void> {
  await writeFile(CATALOG_JSON, `${JSON.stringify(catalog, null, 2)}\n`);
}
