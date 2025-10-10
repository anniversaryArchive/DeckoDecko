export function buildSelectQuery<T>(tableName: TTable, options?: TQueryOptions<T>): string {
  let sql = `SELECT * FROM ${tableName}`;

  if (options) {
    sql += buildOptionQuery(options);
  }

  return sql;
}

export function buildDeleteQuery<T>(tableName: TTable, options: TQueryOptions<T>): string {
  let sql = `DELETE FROM ${tableName}`;

  if (options) {
    sql += buildOptionQuery(options, true);
  }

  return sql;
}

export function buildInsertQuery<T extends object>(tableName: TTable, data: Partial<T>): string {
  // 데이터 객체에서 키(컬럼명) 배열을 추출합니다.
  const columns = Object.keys(data);

  if (columns.length === 0) {
    throw new Error("INSERT할 데이터가 비어있습니다.");
  }

  // 'INSERT INTO 테이블명 (컬럼1, 컬럼2) VALUES (?, ?)' 형태의 문자열 생성
  const columnNames = columns.join(", ");
  const placeholders = columns.map(() => "?").join(", ");

  return `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
}

function buildOptionQuery<T>(options: TQueryOptions<T>, isDelete = false): string {
  let optionSql = "";
  const params: any[] = [];
  const whereClauses: string[] = [];

  // WHERE 절 처리
  if (options?.where) {
    for (const key in options.where) {
      // options.where 객체에 실제로 키가 있는지 확인
      if (Object.prototype.hasOwnProperty.call(options.where, key)) {
        whereClauses.push(`${key} = ?`);
        params.push(options.where[key as keyof T]);
      }
    }
    if (whereClauses.length > 0) {
      optionSql += ` WHERE ${whereClauses.join(" AND ")}`;
    }
  }

  if (!isDelete) {
    if (options?.sort?.orderBy) {
      // 정렬(ORDER BY) 절 처리
      const column = String(options.sort.orderBy);
      const direction = options.sort.order || "ASC";
      optionSql += ` ORDER BY ${column} ${direction}`;
    }

    // LIMIT 절 처리
    if (options?.limit) {
      optionSql += ` LIMIT ?`;
      params.push(options.limit);
    }
  }

  return optionSql;
}
