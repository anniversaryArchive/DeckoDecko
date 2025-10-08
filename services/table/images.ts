import * as SQLite from "expo-sqlite";

import CommonTabledbInstance from "@/utils/sqlite";
import { buildSelectQuery, buildDeleteQuery, buildInsertQuery } from "@utils/buildSqliteQuery";

class TbImages {
  #dbInstance: Promise<SQLite.SQLiteDatabase | null>;

  constructor() {
    this.#dbInstance = this.init();
  }

  private async init(): Promise<SQLite.SQLiteDatabase | null> {
    try {
      const inst = await CommonTabledbInstance.createDBInstance();
      if (inst instanceof SQLite.SQLiteDatabase) {
        await inst.runAsync(`
           CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assetId TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          );`);
      }
      return inst;
    } catch (error) {
      console.error("TbImages Init Error : ", error);
      return null;
    }
  }

  async create(assetId: string): Promise<boolean> {
    try {
      const db = await this.#dbInstance;
      if (!db) return false;

      const res = await db.runAsync(buildInsertQuery<TImage>("images", { assetId }));

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
    const db = await this.#dbInstance;
    if (!db) return [];

    try {
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
    const db = await this.#dbInstance;
    if (!db) return null;

    try {
      return await db.getFirstAsync<TImage>(buildSelectQuery<TImage>("images", options));
    } catch (error) {
      console.error("TbImages getAll Error : ", error);
      return null;
    }
  }

  async delete(options: TDeleteQueryOptions<TImage>): Promise<boolean> {
    const db = await this.#dbInstance;
    if (!db) return false;

    try {
      const result = await db.runAsync(buildDeleteQuery<TImage>("images", options));
      return result.changes > 0;
    } catch (error) {
      console.error(`TbImages options: ${options}\ndelete Error: ${error}`);
      return false;
    }
  }
}

export default new TbImages();
