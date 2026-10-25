-- 20261025154959_get_top_gacha_views.sql
-- #137: 인기 집계 RPC. 레거시는 앱이 10일치 조회 로그를 다 받아 직접 셌다.
-- 이제 서버가 세고, 앱은 상위 N개만 받는다.
--
-- - 기간: 오늘(한국 시간)을 포함한 최근 10일. viewed_on 이 한국 날짜라 같은 기준이다.
-- - 순서: 조회 수 많은 순 -> 최신 가챠 -> id. 조회가 0인 가챠는 나오지 않는다.
-- - 결과 모양은 search_gacha_with_anime 와 같다 (total_count 대신 view_count). 앱 매핑을 같이 쓴다.
-- - security definer: anon 은 gacha_view_log 를 읽을 수 없다(#135). 이 함수만 개수를 센다.
--   돌려주는 건 가챠별 개수뿐이라 device_id 는 밖으로 나가지 않는다.
-- - 집계 인덱스는 #135 의 gacha_view_log_viewed_on_gacha_id_idx (viewed_on, gacha_id) 를 쓴다.
--   날짜 범위로 좁히고 gacha_id 를 인덱스에서 바로 센다. 새 인덱스는 만들지 않는다.

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
security definer
set search_path = ''
as $$
  with views as (
    select l.gacha_id, count(*) as view_count
    from "public"."gacha_view_log" l
    where l.viewed_on > (now() at time zone 'Asia/Seoul')::date - 10
    group by l.gacha_id
  )
  select
    g.id::bigint,
    g.name::text,
    g.name_kr::text,
    g.image_link::text,
    g.price::bigint,
    g.release_month,
    g.anime_id::bigint,
    a.kr_title::text,
    a.jp_title::text,
    a.en_title::text,
    a.type::text,
    (select count(*) from "public"."gacha_items" gi where gi.gacha_id = g.id) as item_count,
    v.view_count
  from views v
  join "public"."gacha" g on g.id = v.gacha_id
  left join "public"."anime" a on a.id = g.anime_id
  order by v.view_count desc, g.created_at desc nulls last, g.id desc
  limit least(greatest(coalesce(limit_count, 10), 1), 50)
$$;

revoke all on function "public"."get_top_gacha_views"(int) from public;
grant execute on function "public"."get_top_gacha_views"(int) to "anon", "authenticated";
