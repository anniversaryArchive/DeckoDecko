-- 20261025152222_search_gacha_rpc.sql
-- #136: 상품명 · 작품명 통합 검색 RPC.
-- 규칙은 앱 메모리 저장소(gacha.memory.ts)와 같다: 전각 -> 반각(NFKC), 소문자, 공백 제거 뒤 부분 일치.
-- 메모리 저장소와 다른 점: 작품 별칭(anime.aliases)도 찾는다.

-- ─────────────────────────────────────────────
-- 1. 부분 일치 인덱스용 확장
--    Supabase 는 확장을 extensions 스키마에 둔다.
-- ─────────────────────────────────────────────
create extension if not exists pg_trgm with schema extensions;

-- ─────────────────────────────────────────────
-- 2. 검색용 정규화 함수
--    인덱스 식에 쓰려면 immutable 이어야 한다. 쿼리와 인덱스가 같은 함수를 써야 인덱스를 탄다.
--    이 함수의 규칙을 바꾸면 gacha_name_search_idx · gacha_name_kr_search_idx 를 다시 만든다 (기존 인덱스 값은 그대로 남는다).
-- ─────────────────────────────────────────────
create or replace function "public"."search_normalize"(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select regexp_replace(lower(normalize(value, nfkc)), '\s+', '', 'g')
$$;

revoke all on function "public"."search_normalize"(text) from public;
-- service_role · postgres 는 Supabase 기본 권한으로 남는다 (백오피스가 gacha 에 넣을 때 인덱스 식 계산에 필요).
grant execute on function "public"."search_normalize"(text) to "anon", "authenticated";

-- ─────────────────────────────────────────────
-- 3. 검색용 인덱스 (trigram GIN: like '%...%' 부분 일치를 돕는다)
--    가챠 이름에만 단다. 작품은 수가 적어 작품명 · 별칭을 인덱스 없이 훑는다
--    (별칭 text[] 는 인덱스 식에 못 넣고, 같은 OR 에 있으면 작품명 인덱스도 쓰이지 않는다).
-- ─────────────────────────────────────────────
create index "gacha_name_search_idx"
  on "public"."gacha" using gin (("public"."search_normalize"("name")) "extensions"."gin_trgm_ops");
create index "gacha_name_kr_search_idx"
  on "public"."gacha" using gin (("public"."search_normalize"("name_kr")) "extensions"."gin_trgm_ops");

-- ─────────────────────────────────────────────
-- 4. 검색 RPC
--    - 가챠 이름(원문 · 한국어) 또는 작품명(한 · 일 · 영) · 별칭에 부분 일치한 가챠를 최신순으로 돌려준다.
--    - total_count 는 페이지와 상관없는 전체 개수다. 모든 행에 같은 값이 들어 있다.
--      offset 이 전체를 넘어 빈 페이지가 되면 행이 없으니 total_count 도 못 받는다 (호출하는 쪽이 offset 0 으로 다시 센다).
--    - limit · offset 은 메모리 저장소와 같다: 1 미만 · null 이면 기본 20, offset 은 0 미만 · null 이면 0. limit 상한은 100.
--    - 빈 검색어는 결과 없음. LIKE 특수문자(% _ \)는 글자 그대로 찾는다.
--    - security invoker(기본)라 anon 이 읽을 수 있는 행만 나온다 (RLS 그대로).
--    - trigram 은 3글자부터 인덱스가 걸러 준다. 1~2글자 검색은 거의 전체를 훑는다.
-- ─────────────────────────────────────────────
create or replace function "public"."search_gacha_with_anime"(
  keyword      text,
  limit_count  int default 20,
  offset_count int default 0
)
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
  total_count     bigint
)
language sql
stable
set search_path = ''
as $$
  with q as (
    select
      "public"."search_normalize"(keyword) as needle,
      '%' || replace(replace(replace("public"."search_normalize"(keyword), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  ),
  -- 작품명 · 별칭이 맞는 작품 (작품 수가 적어 인덱스 없이 훑는다)
  matched_anime as (
    select a.id
    from "public"."anime" a, q
    where q.needle <> ''
      and (
        "public"."search_normalize"(a.kr_title) like q.pattern
        or "public"."search_normalize"(a.jp_title) like q.pattern
        or "public"."search_normalize"(a.en_title) like q.pattern
        or exists (
          select 1 from unnest(a.aliases) as alias
          where "public"."search_normalize"(alias) like q.pattern
        )
      )
  ),
  -- gacha · anime 컬럼을 한 OR 에 섞으면 조인 뒤 필터가 되어 인덱스를 못 쓴다. 따로 찾아 합친다.
  ids as (
    select g.id
    from "public"."gacha" g, q
    where q.needle <> ''
      and (
        "public"."search_normalize"(g.name) like q.pattern
        or "public"."search_normalize"(g.name_kr) like q.pattern
      )
    union
    select g.id
    from "public"."gacha" g
    where g.anime_id in (select ma.id from matched_anime ma)
  )
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
    count(*) over () as total_count
  from ids
  join "public"."gacha" g on g.id = ids.id
  left join "public"."anime" a on a.id = g.anime_id
  order by g.created_at desc nulls last, g.id desc
  limit case when limit_count >= 1 then least(limit_count, 100) else 20 end
  offset case when offset_count >= 0 then offset_count else 0 end
$$;

revoke all on function "public"."search_gacha_with_anime"(text, int, int) from public;
grant execute on function "public"."search_gacha_with_anime"(text, int, int) to "anon", "authenticated";
