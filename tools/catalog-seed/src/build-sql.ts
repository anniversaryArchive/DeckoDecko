import { writeFile } from "node:fs/promises";

import { CATALOG_SQL, readCatalog } from "./catalog.ts";
import { buildSql } from "./sql.ts";

const catalog = await readCatalog();
const missing = catalog.entries.flatMap((entry) => entry.items).filter((item) => !item.nameKr);
if (missing.length > 0)
  console.warn(`한국어 이름이 빈 아이템 ${missing.length}개 (name_kr = null 로 들어간다)`);
await writeFile(CATALOG_SQL, buildSql(catalog));
console.log("supabase/catalog/legacy-60.sql 저장");
