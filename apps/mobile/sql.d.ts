// metro.sql-transformer.js 가 .sql 파일을 문자열 모듈로 바꾼다 (drizzle/migrations.js 에서 import).
declare module "*.sql" {
  const content: string;
  export default content;
}
