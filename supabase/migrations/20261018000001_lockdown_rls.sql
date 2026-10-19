-- 20261018000001_lockdown_rls.sql
-- #114: 첫 마이그레이션(remote_schema)이 anon 에 열어둔 쓰기 권한을 잠근다.
-- 카탈로그(anime · gacha)는 읽기만 공개, 쓰기는 service_role(백오피스)만.
-- 첫 마이그레이션 파일은 dev 에 이미 적용됐으므로 수정하지 않고, 여기서 덮는다.

-- ─────────────────────────────────────────────
-- 1. anime: anon/authenticated 쓰기 권한 회수, SELECT 만 남긴다
-- ─────────────────────────────────────────────
revoke all on table "public"."anime" from "anon", "authenticated";
grant select on table "public"."anime" to "anon", "authenticated";

-- 시퀀스도 회수 (insert 를 막으면 nextval 권한은 필요 없다)
revoke all on sequence "public"."anime_id_seq" from "anon", "authenticated";

-- ─────────────────────────────────────────────
-- 2. gacha: RLS 가 꺼져 있다. 켜고, anon 쓰기 권한 회수, SELECT 만 남긴다
-- ─────────────────────────────────────────────
alter table "public"."gacha" enable row level security;

revoke all on table "public"."gacha" from "anon", "authenticated";
grant select on table "public"."gacha" to "anon", "authenticated";

-- ─────────────────────────────────────────────
-- 3. 읽기 정책 (RLS 가 켜지면 정책이 없는 한 아무도 못 읽는다)
-- ─────────────────────────────────────────────
create policy "anime 읽기 공개" on "public"."anime"
  for select to "anon", "authenticated"
  using (true);

create policy "gacha 읽기 공개" on "public"."gacha"
  for select to "anon", "authenticated"
  using (true);

-- ─────────────────────────────────────────────
-- 4. storage: profile 버킷의 anon UPDATE/DELETE 정책 제거
--    (첫 마이그레이션이 만든 anonymous_user_crud 정책)
-- ─────────────────────────────────────────────
drop policy if exists "anonymous_user_crud 1twvzjd_2" on "storage"."objects";
drop policy if exists "anonymous_user_crud 1twvzjd_3" on "storage"."objects";
