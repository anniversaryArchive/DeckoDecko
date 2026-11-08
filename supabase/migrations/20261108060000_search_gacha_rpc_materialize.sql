-- 20261108060000_search_gacha_rpc_materialize.sql
-- search_gacha_with_anime 가 검색 한 번에 27초 걸려 anon 시간 제한(3초)에 막힌다.
-- 함수 안 쿼리는 인자를 모르는 일반 계획으로 세워져 gacha 를 1행으로 잘못 어림하고, ids 를 가챠 행마다(1,220번) 다시 계산한다.
-- ids 를 materialized 로 한 번만 계산하게 한다. 그 밖의 동작 · 인자 · 반환 형식은 20261029035802 와 같다.

create or replace function "public"."search_gacha_with_anime"(
  keyword        text,
  limit_count    int    default 20,
  offset_count   int    default 0,
  release_filter text   default null,
  this_month     date   default null,
  anime_filter   bigint default null,
  price_min      bigint default null,
  price_max      bigint default null,
  sort_by        text   default 'release'
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
      '%' || replace(replace(replace("public"."search_normalize"(keyword), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern,
      coalesce(date_trunc('month', this_month::timestamp), date_trunc('month', now()))::date as first_day
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
  -- materialized 를 빼면 인자를 모르는 계획이 gacha 를 1행으로 어림해 ids 를 가챠 행마다 다시 계산한다 (27초).
  ids as materialized (
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
  cross join q
  where (anime_filter is null or g.anime_id = anime_filter)
    and (price_min is null or g.price >= price_min)
    and (price_max is null or g.price <= price_max)
    -- 발매월이 null 이면 case 가 null 이 되어 빠진다
    and case release_filter
          when 'new'      then g.release_month = q.first_day
          when 'upcoming' then g.release_month > q.first_day
          else true
        end
  order by
    case when sort_by = 'priceAsc'  then g.price end asc  nulls last,
    case when sort_by = 'priceDesc' then g.price end desc nulls last,
    case when sort_by is distinct from 'priceAsc' and sort_by is distinct from 'priceDesc'
         then g.release_month end desc nulls last,
    g.created_at desc nulls last,
    g.id desc
  limit case when limit_count >= 1 then least(limit_count, 100) else 20 end
  offset case when offset_count >= 0 then offset_count else 0 end
$$;

revoke all on function "public"."search_gacha_with_anime"(text, int, int, text, date, bigint, bigint, bigint, text) from public;
grant execute on function "public"."search_gacha_with_anime"(text, int, int, text, date, bigint, bigint, bigint, text) to "anon", "authenticated";
