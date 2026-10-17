// babel-plugin-inline-import 로 .sql 파일을 문자열로 import 한다 (drizzle/migrations.js).
declare module "*.sql" {
  const content: string;
  export default content;
}
