import * as SQLite from "expo-sqlite";

import { buildSelectQuery, buildDeleteQuery, buildInsertQuery } from "@utils/buildSqliteQuery";

interface TImage {
  id?: number;
  uri: string;
  created_at?: string;
}

class TbImages {
  #dbInstance: Promise<SQLite.SQLiteDatabase>;

  constructor() {
    this.#dbInstance = this.init();
  }

  private async init(): Promise<SQLite.SQLiteDatabase> {
    try {
      const db = SQLite.openDatabaseSync('deckodecko.db');

      await db.execAsync(`
          CREATE TABLE IF NOT EXISTS images (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                uri TEXT NOT NULL,
                                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
      `);

      return db;
    } catch (error) {
      console.error("TbImages Init Error : ", error);
      throw error;
    }
  }

  async create(uri: string): Promise<boolean> {
    try {
      const db = await this.#dbInstance;
      // 수정: buildInsertQuery 반환값을 분리해서 runAsync에 넘김
      const [query, ...params] = buildInsertQuery<TImage>("images", { uri });
      const res = await db.runAsync(query, params);

      return !!res.changes;
    } catch (error) {
      console.error("TbImages create Error : ", error);
      return false;
    }
  }

  async getAll(
    options = {
      sort: {
        orderBy: "created_at",
        order: "DESC",
      },
    } as TSelectQueryOptions<TImage>
  ): Promise<TImage[]> {
    try {
      const db = await this.#dbInstance;
      return await db.getAllAsync<TImage>(buildSelectQuery<TImage>("images", options));
    } catch (error) {
      console.error("TbImages getAll Error : ", error);
      return [];
    }
  }

  async getOne(
    options = {
      sort: {
        orderBy: "created_at",
        order: "DESC",
      },
    } as TSelectQueryOptions<TImage>
  ): Promise<TImage | null> {
    try {
      const db = await this.#dbInstance;
      return await db.getFirstAsync<TImage>(buildSelectQuery<TImage>("images", options));
    } catch (error) {
      console.error("TbImages getOne Error : ", error);
      return null;
    }
  }

  async delete(options: TDeleteQueryOptions<TImage>): Promise<boolean> {
    try {
      const db = await this.#dbInstance;
      const result = await db.runAsync(buildDeleteQuery<TImage>("images", options));
      return result.changes > 0;
    } catch (error) {
      console.error(`TbImages options: ${options}\ndelete Error: ${error}`);
      return false;
    }
  }

  async migration(): Promise<boolean> {
    try {
      const db = await this.#dbInstance;

      const tables = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='images';");
      if (tables.length === 0) {
        console.log("Images table does not exist, skipping migration");
        return true;
      }

      const columns = await db.getAllAsync("PRAGMA table_info(images);");
      const hasAssetId = columns.some((col: any) => col.name === 'assetId');
      const hasUri = columns.some((col: any) => col.name === 'uri');

      if (!hasAssetId || hasUri) {
        console.log("Images table already migrated or no migration needed");
        return true;
      }

      await db.runAsync(`
          CREATE TABLE images_new (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      uri TEXT NOT NULL,
                                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
      `);

      await db.runAsync(`
          INSERT INTO images_new (id, uri, created_at)
          SELECT id, assetId, created_at FROM images;
      `);

      await db.runAsync(`DROP TABLE images;`);
      await db.runAsync(`ALTER TABLE images_new RENAME TO images;`);

      console.log("Images migration completed successfully");
      return true;
    } catch (error) {
      console.error("TbImages migration Error:", error);
      return false;
    }
  }
}

export default new TbImages();
