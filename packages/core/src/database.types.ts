/**
 * Supabase 가 생성하는 DB 타입. 손으로 고치지 않는다.
 * 스키마가 바뀌면 `pnpm --filter @deckodecko/core gen:types` 로 다시 만든다 (로컬 supabase start 상태에서).
 * 아직 마이그레이션이 없어 빈 틀만 있다. 첫 스키마가 들어오면 이 파일 전체가 생성 결과로 바뀐다.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
