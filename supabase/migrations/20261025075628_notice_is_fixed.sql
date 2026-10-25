-- 20261025075628_notice_is_fixed.sql
-- #143: 고정 공지. 고정 공지는 공지 목록 맨 위에 오고, 앱 홈 공지 띠는 고정 공지만 최신순으로 보인다.
-- 홈 띠에 보일지를 따로 고르는 칼럼은 두지 않는다 (고정 = 홈 띠).

alter table "public"."notice"
  add column "is_fixed" boolean not null default false;
