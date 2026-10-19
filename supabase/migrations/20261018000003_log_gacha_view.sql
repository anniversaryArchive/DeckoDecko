-- 20261018000003_log_gacha_view.sql
-- #115: 조회 로그 기록 함수. anon 이 로그 테이블에 직접 못 쓰게 하고,
-- 이 함수로만 기록한다. security definer 라 함수 소유자 권한으로 INSERT 한다.
-- 기기·가챠·날짜 조합이 이미 있으면 아무것도 하지 않는다(하루 1건).

create or replace function "public"."log_gacha_view"(p_gacha_id bigint, p_device_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 존재하는 가챠만 기록 (잘못된 id 로 로그가 쌓이는 것 방지)
  if not exists (select 1 from public.gacha where id = p_gacha_id) then
    return;
  end if;

  insert into public.gacha_view_log (gacha_id, device_id)
  values (p_gacha_id, p_device_id)
  on conflict (gacha_id, device_id, viewed_on) do nothing;
end;
$$;

-- 함수 실행 권한만 anon 에 준다 (테이블 직접 접근 권한은 없음)
revoke all on function "public"."log_gacha_view"(bigint, text) from public;
grant execute on function "public"."log_gacha_view"(bigint, text) to "anon", "authenticated";
