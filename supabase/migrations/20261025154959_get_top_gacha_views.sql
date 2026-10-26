-- 20261025154959_get_top_gacha_views.sql
-- 인기 집계 RPC. 최근 10일 조회 수가 많은 가챠 상위 N개.
--
-- - 기간: 오늘(한국 시간)을 포함한 최근 10일. viewed_on 이 한국 날짜라 같은 기준이다.
-- - 순서: 조회 수 많은 순 -> 최신 가챠 -> id. 조회가 0인 가챠는 나오지 않는다.
-- - 결과 모양은 search_gacha_with_anime 와 같다 (total_count 대신 view_count). 앱 매핑을 같이 쓴다.
-- - 집계는 gacha_view_log_viewed_on_gacha_id_idx (viewed_on, gacha_id) 를 쓴다. 새 인덱스는 만들지 않는다.

-- ─────────────────────────────────────────────
-- 1. 개수만 세는 함수 (security definer)
--    anon 은 gacha_view_log 를 읽을 수 없어서 이 함수만 소유자 권한으로 센다.
--    가챠 · 작품은 읽지 않는다. definer 로 조인하면 그 테이블의 RLS(나중에 생길 숨김 정책 등)까지 건너뛴다.
--    돌려주는 건 가챠 id 별 개수뿐이라 device_id 는 밖으로 나가지 않는다.
-- ─────────────────────────────────────────────
create or replace function "public"."count_gacha_views"()
returns table (
  gacha_id   bigint,
  view_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select l.gacha_id, count(*)
  from "public"."gacha_view_log" l
  where l.viewed_on > (now() at time zone 'Asia/Seoul')::date - 10
  group by l.gacha_id
$$;

revoke all on function "public"."count_gacha_views"() from public;
grant execute on function "public"."count_gacha_views"() to "anon", "authenticated";

-- ─────────────────────────────────────────────
-- 2. 인기 RPC (security invoker, 기본)
--    가챠 · 작품은 부르는 사람 권한으로 읽어서 카탈로그 RLS 를 그대로 따른다.
-- ─────────────────────────────────────────────
create or replace function "public"."get_top_gacha_views"(limit_count int default 10)
returns table (
  id              bigint,
  name            text,
  name_kr         text,
  image_link      text,
  price           bigint,
  release_month   date,
  anime_id        bigint,
  anime_kr_title  text,
  anime_jp_title  text,
  anime_en_title  text,
  anime_type      text,
  item_count      bigint,
  view_count      bigint
)
language sql
stable
set search_path = ''
as $$
  select
    g.id,
    g.name,
    g.name_kr,
    g.image_link,
    g.price,
    g.release_month,
    g.anime_id,
    a.kr_title,
    a.jp_title,
    a.en_title,
    a.type::text, -- varchar -> returns table 의 text
    (select count(*) from "public"."gacha_items" gi where gi.gacha_id = g.id) as item_count,
    v.view_count
  from "public"."count_gacha_views"() v
  join "public"."gacha" g on g.id = v.gacha_id
  left join "public"."anime" a on a.id = g.anime_id
  order by v.view_count desc, g.created_at desc nulls last, g.id desc
  limit least(greatest(coalesce(limit_count, 10), 1), 50)
$$;

revoke all on function "public"."get_top_gacha_views"(int) from public;
grant execute on function "public"."get_top_gacha_views"(int) to "anon", "authenticated";
