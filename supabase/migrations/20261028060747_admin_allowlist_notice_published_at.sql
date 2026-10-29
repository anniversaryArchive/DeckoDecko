-- 20261028060747_admin_allowlist_notice_published_at.sql
-- 백오피스용 운영자 허용 목록과 예약 공지(notice.published_at).
--
-- - 허용 목록은 백오피스 서버가 service role 로 읽어 로그인 가능 여부를 판단한다. 앱(anon)은 읽지도 쓰지도 못한다.
-- - 예약 공지: 게시(is_published)를 켜도 published_at 이 오기 전에는 앱에 보이지 않는다.

-- ─────────────────────────────────────────────
-- 1. admin_allowlist: 운영자 허용 목록
--    이메일은 소문자 · 앞뒤 공백 없이 저장해서, 비교할 때 lower(btrim(...)) 한 값과 그대로 맞춘다.
--    실제 운영자 이메일은 레포에 넣지 않고 dev · prod SQL Editor 에서 넣는다.
-- ─────────────────────────────────────────────
create table "public"."admin_allowlist" (
  "email"      text primary key
               check (email = lower(btrim(email)) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  "name"       text check (char_length(name) <= 50),
  "created_at" timestamptz not null default now()
);

alter table "public"."admin_allowlist" enable row level security;

-- 정책 없음 + 권한 회수: anon · authenticated 는 아무것도 못 한다. service role 은 RLS 를 건너뛴다.
revoke all on table "public"."admin_allowlist" from "anon", "authenticated";

-- ─────────────────────────────────────────────
-- 2. notice.published_at: 게시 시각 (예약 게시)
--    게시 시각을 아직 정하지 않은 비공개 초안은 null 이다. 기본값은 두지 않는다.
--    게시 상태로 만들 때는 백오피스가 now() 나 예약 시각을 넣는다.
-- ─────────────────────────────────────────────
alter table "public"."notice"
  add column "published_at" timestamptz;

-- 기존 공지는 게시된 것만 만든 시각으로 채운다. 비공개 공지는 null 로 둔다.
-- updated_at 이 바뀌지 않게 트리거를 잠시 끈다.
alter table "public"."notice" disable trigger "notice_set_updated_at";
update "public"."notice" set "published_at" = "created_at" where "is_published";
alter table "public"."notice" enable trigger "notice_set_updated_at";

-- 게시 상태면 게시 시각이 꼭 있다
alter table "public"."notice"
  add constraint "notice_published_at_required"
  check (not is_published or published_at is not null);

-- 앱은 게시를 켰고 게시 시각이 지난 공지만 본다 (published_at 이 null 이면 false 라 안 보인다)
drop policy "notice_select_published" on "public"."notice";
create policy "notice_select_published" on "public"."notice"
  for select to "anon", "authenticated"
  using (is_published = true and published_at <= now());

-- 게시된 공지를 최신 게시순으로 읽는 목록용
create index "notice_published_at_idx"
  on "public"."notice"(published_at desc)
  where is_published;
