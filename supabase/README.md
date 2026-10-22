# supabase/ (백엔드)

Supabase 프로젝트의 코드형 정의.

```
supabase/
├── config.toml          # supabase init 이 생성. 로컬(supabase start) 설정
├── migrations/          # 테이블·RLS·RPC SQL (날짜_설명.sql)
├── seed.sql             # 개발용 샘플 데이터 (가챠 20개)
└── functions/           # Edge Functions (1.1 인식 API)
```

- 앱과 백오피스는 `packages/core` 의 생성된 타입(`supabase gen types typescript`)으로 이 스키마를 쓴다.
- 규칙: 대시보드에서 직접 스키마를 바꾸지 않는다. 항상 마이그레이션 파일로.

## 프로젝트

| 환경 | Supabase 프로젝트 | ref                    | 쓰는 곳                                |
| ---- | ----------------- | ---------------------- | -------------------------------------- |
| dev  | `DeckoDecko`      | `mdlgzwgxvvncejtpdfmq` | 로컬 개발, EAS `development`·`preview` |
| prod | (출시 전 생성)    | -                      | EAS `production`                       |

## 처음 한 번

CLI 는 루트 devDependency(`supabase`)로 들어 있어 따로 설치하지 않는다. 명령은 레포 루트에서 `pnpm exec supabase ...` 로 돌린다.

```bash
pnpm install
pnpm exec supabase login                                    # 팀 공용 Supabase 계정으로 브라우저 로그인
pnpm exec supabase link --project-ref mdlgzwgxvvncejtpdfmq  # dev 에 연결
```

`link` 나 `db push` 가 DB 비밀번호를 물으면 혜진에게 받는다 (레포 · 채팅에 붙이지 않는다).
`db pull`, `db diff`, `supabase start` 는 Docker 가 켜져 있어야 한다.

### 환경변수

Supabase 는 팀 공용 계정으로 로그인하고, Expo `deckodecko` org 에 초대받았다면 값을 따로 전달받을 필요가 없다.

- 앱: EAS 환경변수에서 받아 온다.

  ```bash
  cd apps/mobile
  pnpm dlx eas-cli login
  pnpm dlx eas-cli env:pull --environment development   # apps/mobile/.env.local 생성
  ```

- 백오피스: `apps/admin/.env.example` 을 `.env.local` 로 복사해 dev 값을 채운다.

값은 Supabase 대시보드 → Project Settings → API Keys 에 있다. 새 키 방식(publishable `sb_publishable_...` · secret `sb_secret_...`)을 쓰고, legacy anon · service_role 키는 쓰지 않는다. secret key 는 `apps/admin/.env.local` 에만 넣는다.

## 마이그레이션 흐름

```bash
pnpm exec supabase migration new <설명>      # supabase/migrations/<시각>_<설명>.sql 생성
# SQL 작성
pnpm exec supabase db push --dry-run         # dev 에 적용될 파일 확인
pnpm exec supabase db push                   # dev 에 적용
pnpm exec supabase gen types typescript --linked > packages/core/src/database.types.ts
```

- 생성 타입은 `packages/core/src/database.types.ts` 에 둔다. 손으로 고치지 않고 마이그레이션을 바꿀 때마다 다시 만든다.
- 아직 dev 에 push 하지 않은 마이그레이션의 타입은 로컬 DB(`supabase start` 후)에서 만든다: `--linked` 대신 `--local`.
- Windows PowerShell 에서는 `>` 대신 `| Out-File -Encoding utf8 packages/core/src/database.types.ts` 를 쓴다 (`>` 는 UTF-16 으로 저장된다).
- 이미 push 된 마이그레이션 파일은 고치지 않는다. 바꿀 게 있으면 새 마이그레이션을 추가한다.
- prod 적용은 출시 준비 때 따로 정한다 (dev 에서 검증된 마이그레이션만).

## dev 를 못 쓸 때

DB 비밀번호가 없거나 dev 에 문제가 있으면 로컬에서만 확인하고 SQL 만 PR 한다. 혜진이 dev 에 적용한다.

```bash
pnpm exec supabase start      # Docker 필요. 로컬 Postgres + Studio(http://localhost:54323)
pnpm exec supabase db reset   # migrations/ + seed.sql 을 로컬에 다시 적용
```
