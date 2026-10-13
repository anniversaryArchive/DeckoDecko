# supabase/ (백엔드)

Supabase 프로젝트의 코드형 정의. 직장인 1주차 주말(10/17–18) 작업에서 `supabase init` 으로 채운다.

```
supabase/
├── config.toml          # supabase init 이 생성
├── migrations/          # 테이블·RLS·RPC SQL (날짜_설명.sql)
├── seed.sql             # 개발용 샘플 데이터 (가챠 20개)
└── functions/           # Edge Functions (1.1 인식 API)
```

- 앱과 백오피스는 `packages/core` 의 생성된 타입(`supabase gen types typescript`)으로 이 스키마를 쓴다.
- 규칙: 대시보드에서 직접 스키마를 바꾸지 않는다. 항상 마이그레이션 파일로.
