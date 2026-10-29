-- seed.sql
-- 로컬 개발용 가짜 데이터. `supabase db reset` 때 마이그레이션 다음에 실행된다.
-- dev/prod 에는 들어가지 않는다 (db push 는 seed 를 올리지 않음).
-- 작품 4개 · 가챠 20개(작품당 5개) · 가챠당 아이템 4~6개 · 공지 2개 (기획서 12절)
-- 작품/상품은 전부 지어낸 이름이다.

-- ─────────────────────────────────────────────
-- 1. anime (작품)
-- ─────────────────────────────────────────────
insert into "public"."anime" (id, jp_title, kr_title, en_title, kr_sub_title, type, aliases) values
  (1, '星の森',             '별의 숲',       'Forest of Stars',   null,          'anime', '{별숲,호시모리}'),
  (2, 'ねこ郵便局',          '고양이 우체국',  'Cat Post Office',   null,          'anime', '{냥우체국}'),
  (3, '魔法少女ルル',        '마법소녀 루루',  'Magical Girl Lulu', '시즌 2',       'anime', '{루루}'),
  (4, 'ピクセルダンジョン',   '픽셀 던전',     'Pixel Dungeon',     null,          'game',  '{픽던}');

-- id 를 직접 넣었으니 다음 번호가 5부터 나오게 맞춘다
select setval(pg_get_serial_sequence('public.anime', 'id'), (select max(id) from "public"."anime"));

-- ─────────────────────────────────────────────
-- 2. gacha (가챠) — id 는 자동 번호(identity)지만 화면 확인용으로 고정 id 를 넣고, 아래에서 시퀀스를 맞춘다
-- ─────────────────────────────────────────────
insert into "public"."gacha" (id, anime_id, name, name_kr, price, image_link) values
  ( 1, 1, '星の森 ラバーマスコット',            '별의 숲 러버 마스코트',         400, 'https://placehold.co/400x400?text=G01'),
  ( 2, 1, '星の森 アクリルスタンド',            '별의 숲 아크릴 스탠드',         500, 'https://placehold.co/400x400?text=G02'),
  ( 3, 1, '星の森 ミニフィギュア',              '별의 숲 미니 피규어',           500, 'https://placehold.co/400x400?text=G03'),
  ( 4, 1, '星の森 缶バッジ',                    '별의 숲 캔뱃지',                300, 'https://placehold.co/400x400?text=G04'),
  ( 5, 1, '星の森 ぬいぐるみキーホルダー',      '별의 숲 인형 키홀더',           500, 'https://placehold.co/400x400?text=G05'),
  ( 6, 2, 'ねこ郵便局 ちょこんとフィギュア',    '고양이 우체국 앉은 피규어',     300, 'https://placehold.co/400x400?text=G06'),
  ( 7, 2, 'ねこ郵便局 スタンプコレクション',    '고양이 우체국 스탬프 컬렉션',   300, 'https://placehold.co/400x400?text=G07'),
  ( 8, 2, 'ねこ郵便局 ミニポーチ',              '고양이 우체국 미니 파우치',     400, 'https://placehold.co/400x400?text=G08'),
  ( 9, 2, 'ねこ郵便局 ラバーキーホルダー',      '고양이 우체국 러버 키홀더',     300, 'https://placehold.co/400x400?text=G09'),
  (10, 2, 'ねこ郵便局 ミニチュアポスト',        '고양이 우체국 미니어처 우체통', 500, 'https://placehold.co/400x400?text=G10'),
  (11, 3, '魔法少女ルル 変身ステッキ',          '마법소녀 루루 변신 스틱',       500, 'https://placehold.co/400x400?text=G11'),
  (12, 3, '魔法少女ルル アクリルチャーム',      '마법소녀 루루 아크릴 참',       400, 'https://placehold.co/400x400?text=G12'),
  (13, 3, '魔法少女ルル カプセルフィギュア',    '마법소녀 루루 캡슐 피규어',     500, 'https://placehold.co/400x400?text=G13'),
  (14, 3, '魔法少女ルル ラバーストラップ',      '마법소녀 루루 러버 스트랩',     300, 'https://placehold.co/400x400?text=G14'),
  (15, 3, '魔法少女ルル ミニ色紙',              '마법소녀 루루 미니 색지',       300, 'https://placehold.co/400x400?text=G15'),
  (16, 4, 'ピクセルダンジョン ドット缶バッジ',  '픽셀 던전 도트 캔뱃지',         300, 'https://placehold.co/400x400?text=G16'),
  (17, 4, 'ピクセルダンジョン モンスターフィギュア', '픽셀 던전 몬스터 피규어',   500, 'https://placehold.co/400x400?text=G17'),
  (18, 4, 'ピクセルダンジョン 宝箱マスコット',  '픽셀 던전 보물상자 마스코트',   400, 'https://placehold.co/400x400?text=G18'),
  (19, 4, 'ピクセルダンジョン アクリルブロック', '픽셀 던전 아크릴 블록',        500, 'https://placehold.co/400x400?text=G19'),
  (20, 4, 'ピクセルダンジョン ラバーコースター', '픽셀 던전 러버 코스터',        400, 'https://placehold.co/400x400?text=G20');

-- id 를 직접 넣었으니 백오피스 · 로컬에서 새로 추가할 때 21번부터 나오게 맞춘다
select setval(pg_get_serial_sequence('public.gacha', 'id'), (select max(id) from "public"."gacha"));

-- 등록일을 하루씩 벌려서 최신순 정렬 · NEW 표시를 확인할 수 있게 한다 (20번이 제일 최신)
-- 발매 월은 등록일이 속한 달의 1일로 채운다 (상세 화면 발매 월 확인용)
-- set_updated_at 트리거가 updated_at 을 now() 로 덮지 않게 잠깐 끈다
alter table "public"."gacha" disable trigger "gacha_set_updated_at";
update "public"."gacha"
  set created_at    = now() - make_interval(days => 21 - id::int),
      updated_at    = now() - make_interval(days => 21 - id::int),
      release_month = date_trunc('month', now() - make_interval(days => 21 - id::int))::date;
alter table "public"."gacha" enable trigger "gacha_set_updated_at";

-- ─────────────────────────────────────────────
-- 3. gacha_items (라인업) — 가챠마다 4~6개
--    id % 3 으로 개수를 돌려서 4개 · 5개 · 6개가 섞이게 한다
-- ─────────────────────────────────────────────
insert into "public"."gacha_items" (gacha_id, name, name_kr, image_link, sort_order)
select
  g.id,
  g.name    || ' No.' || n,
  g.name_kr || ' ' || n || '번',
  'https://placehold.co/300x300?text=G' || lpad(g.id::text, 2, '0') || '-' || n,
  n
from "public"."gacha" g
cross join lateral generate_series(1, 4 + (g.id % 3)::int) as n;

-- ─────────────────────────────────────────────
-- 4. notice (공지). 고정 공지만 앱 홈 공지 띠에 보인다
-- ─────────────────────────────────────────────
-- 게시된 공지는 published_at 이 있어야 한다 (notice_published_at_required). 만든 시각과 같게 넣는다.
insert into "public"."notice" (title, body, is_published, is_fixed, published_at, created_at, updated_at) values
  ('가챠 탐색대 1.0 오픈 안내',
   '가챠 탐색대가 새로워졌어요! 갖고 싶은 가챠는 WISH, 뽑은 가챠는 GET으로 기록해 보세요.',
   true, true, now() - interval '2 days', now() - interval '2 days', now() - interval '2 days'),
  ('11월 신규 가챠 업데이트',
   '11월 신규 가챠 20종을 추가했어요. 홈 화면 NEW 표시를 확인해 주세요.',
   true, false, now() - interval '1 day', now() - interval '1 day', now() - interval '1 day');
