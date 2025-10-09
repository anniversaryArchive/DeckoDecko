type TTable = "images" | "folder" | "items";

type TSortOptions<T> = {
  orderBy: keyof T;
  order?: "ASC" | "DESC";
};

type TQueryOptions<T> = TSelectQueryOptions<T> | TDeleteQueryOptions<T>;

type TSelectQueryOptions<T> = {
  sort?: TSortOptions<T>;
  where?: Partial<T>;
  limit?: number;
};

type TDeleteQueryOptions<T> = {
  sort?: never;
  where?: Partial<T>;
  limit?: never;
};
