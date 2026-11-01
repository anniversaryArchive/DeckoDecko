# 이미지 삭제 요청 대응

권리자 요청이나 App Store · Google Play 심사 지적으로 공식 이미지를 내릴 때 따르는 절차. 결정 이유는 [ADR 0006](adr/0006-image-takedown.md).

## 정해진 것

| 항목      | 내용                                                                 |
| --------- | -------------------------------------------------------------------- |
| 연락처    | `anniversaryarchive@gmail.com` (팀 공용). 스토어 등록 정보 · 앱 설정 |
| 담당      | 요청을 먼저 본 사람. 시작할 때 팀 채팅에 알려 겹치지 않게 한다       |
| 내리는 곳 | prod Supabase 대시보드의 SQL Editor                                  |

## 범위 고르기

| 상황                        | 범위                  | 호출                 |
| --------------------------- | --------------------- | -------------------- |
| 특정 상품만 지적            | 가챠 하나             | `'gacha', <가챠 id>` |
| 작품 · 권리자 단위 요청     | 작품의 모든 가챠      | `'anime', <작품 id>` |
| 스토어 심사 지적, 전체 요청 | 모든 가챠 (전체 비움) | `'all', null`        |

어느 범위든 `gacha` 와 그 가챠의 `gacha_items` 를 함께 비운다. 작품 하나로 좁히기 어렵거나 판단이 늦어지면 더 넓은 범위로 먼저 내린다.

## 절차

1. **알린다.** 팀 채팅에 요청 메일 제목과 "처리 시작"을 남긴다.
2. **대상을 찾는다.** SQL Editor 왼쪽 위 프로젝트가 prod 인지 확인한 뒤 id 를 찾는다.

   ```sql
   select g.id, g.name, g.name_kr, a.id as anime_id, a.kr_title
   from public.gacha g left join public.anime a on a.id = g.anime_id
   where g.name ilike '%검색어%' or g.name_kr ilike '%검색어%' or a.kr_title ilike '%검색어%';
   ```

3. **내린다.** 사유는 `rights_holder`, `store_review`, `other` 중 하나다. 메모에는 메일 제목처럼 찾아갈 단서만 적고 요청자의 개인정보는 적지 않는다.

   ```sql
   select * from public.take_down_images('anime', 123, 'rights_holder', '메일 제목 또는 심사 건 번호');
   ```

   결과의 `takedown_batch` 를 복사해 둔다. `gacha_rows` 와 `item_rows` 가 모두 0 이면 id 가 틀렸거나 이미 내린 것이다.

4. **확인한다.** 앱을 완전히 껐다 켜서 해당 가챠에 이미지가 보이지 않는지 본다. 이미 켜 둔 앱은 데이터를 다시 받기 전까지 이미지가 남을 수 있다. 앱 빌드나 EAS Update 는 필요 없다.
5. **되살아나지 않게 한다.** 아래 [다시 올라오지 않게](#다시-올라오지-않게)를 따른다.
6. **회신하고 알린다.** 요청자에게 처리 결과를 답하고, 팀 채팅에 범위와 `takedown_batch` 를 남긴다.
7. **스토어 지적 · 전체 내림이면** ADR 0005 를 대체할 ADR 을 쓴다.

## 다시 올라오지 않게

`supabase/catalog/legacy-60.sql` 은 라인업을 지우고 다시 넣으므로, 그대로 다시 실행하면 내린 URL 이 돌아온다.

1. 내린 가챠의 라인업에서 `supabase/catalog/legacy-60.json` 의 `imageLink` 를 `null` 로 바꾼다.
2. `pnpm --filter @deckodecko/catalog-seed sql` 로 SQL 을 다시 만들고 PR 로 올린다.

`gacha.image_link` 는 이 파일이 넣지 않지만, 레거시 데이터를 prod 에 다시 넣는 작업이 있으면 그 전에 아래 목록과 대조한다.

```sql
select source_table, row_id, reason, note, created_at
from public.image_takedowns where restored_at is null order by created_at desc;
```

## 되돌리기

요청이 잘못되었거나 사용 허락을 받았을 때만 한다.

```sql
begin;
update public.gacha g set image_link = t.previous_image_link
  from public.image_takedowns t
  where t.batch_id = '<takedown_batch>' and t.source_table = 'gacha'
    and t.row_id = g.id and t.restored_at is null;
update public.gacha_items i set image_link = t.previous_image_link
  from public.image_takedowns t
  where t.batch_id = '<takedown_batch>' and t.source_table = 'gacha_items'
    and t.row_id = i.id and t.restored_at is null;
update public.image_takedowns set restored_at = now()
  where batch_id = '<takedown_batch>' and restored_at is null;
commit;
```

`legacy-60.sql` 을 다시 실행하면 `gacha_items` 의 id 가 바뀌어 라인업은 이 방법으로 되돌아오지 않는다. 그때는 JSON 의 URL 을 되살려 SQL 을 다시 만든다.

## 한계

- 이미지 원본은 반다이 CDN 에 있다. 이 절차는 앱이 그 주소를 쓰지 않게 할 뿐 원본을 지우지는 못한다.
- 이미지가 없으면 그 자리는 빈 칸으로 보인다.

## 연락처를 바꿀 때

스토어 등록 정보(App Store · Google Play), `apps/mobile/app/settings.tsx` 의 `CONTACT_EMAIL`, 이 문서를 함께 고친다. 앱 안의 주소는 새 빌드를 내야 바뀐다.
