# 이미지 삭제 요청 대응

권리자 요청이나 App Store · Google Play 심사 지적으로 공식 이미지를 내릴 때 따르는 절차. 결정 이유는 [ADR 0006](adr/0006-image-takedown.md).

## 정해진 것

| 항목      | 내용                                                                 |
| --------- | -------------------------------------------------------------------- |
| 연락처    | `anniversaryarchive@gmail.com` (팀 공용). 스토어 등록 정보 · 앱 설정 |
| 담당      | 요청을 먼저 본 사람. 시작할 때 팀 채팅에 알려 겹치지 않게 한다       |
| 내리는 곳 | prod Supabase 대시보드의 SQL Editor                                  |

## 범위 고르기

| 상황                        | 범위                  | 호출                           |
| --------------------------- | --------------------- | ------------------------------ |
| 특정 상품만 지적            | 찾아낸 가챠들         | `'gacha', array[<가챠 id>…]`   |
| 작품 · 아티스트 · 브랜드 등 | 그 미디어의 모든 가챠 | `'anime', array[<미디어 id>…]` |
| 스토어 심사 지적, 전체 요청 | 모든 가챠 (전체 비움) | `'all', null`                  |

`anime` 테이블은 이름과 달리 작품 · 캐릭터 · 게임 · 아이돌 · 브랜드까지 담는 미디어 목록이다. 같은 미디어가 여러 행일 수 있어 찾은 id 를 모두 넣는다. 미디어에 연결되지 않은 가챠는 미디어 범위로 잡히지 않으므로 `'gacha'` 로 함께 내린다.

어느 범위든 `gacha` 와 그 가챠의 `gacha_items` 를 함께 비운다. 작품 하나로 좁히기 어렵거나 판단이 늦어지면 더 넓은 범위로 먼저 내린다.

## 절차

1. **알린다.** 팀 채팅에 요청 메일 제목과 "처리 시작"을 남긴다.
2. **대상을 찾는다.** SQL Editor 왼쪽 위 프로젝트가 prod 인지 확인한 뒤 찾는다. 표기가 갈리므로 한국어와 일본어 원문을 모두 넣고, 결과의 가챠와 미디어가 요청 대상이 맞는지 눈으로 본다.

   ```sql
   select g.id, g.name, g.name_kr, g.image_link is not null as has_image,
          a.id as media_id, a.type, a.kr_title, a.jp_title
   from public.gacha g left join public.anime a on a.id = g.anime_id
   where concat_ws(' ', g.name, g.name_kr, a.kr_title, a.jp_title, a.en_title,
                   array_to_string(a.aliases, ' '))
         ilike any (array['%한국어 검색어%', '%日本語の検索語%'])
   order by g.id;
   ```

3. **내린다.** 사유는 `rights_holder`, `store_review`, `other` 중 하나다. 메모에는 메일 제목처럼 찾아갈 단서만 적고 요청자의 개인정보는 적지 않는다.

   ```sql
   select * from public.take_down_images('anime', array[123, 456], 'rights_holder', '메일 제목 또는 심사 건 번호');
   ```

   결과의 `takedown_batch` 를 복사해 둔다. `target_gachas` 는 범위에 든 가챠 수, `gacha_rows` 와 `item_rows` 는 이번에 실제로 비운 수다. 없는 id 를 넣으면 오류로 멈추고 아무것도 바뀌지 않는다.

4. **남은 이미지를 확인한다.** 2번 쿼리 끝의 `order by` 앞에 `and g.image_link is not null` 을 붙여 다시 돌린다. 나온 행 중 요청 대상이 있으면 `'gacha'` 로 마저 내린다. 표기가 다른 검색어로도 한 번 더 돌린다.
5. **앱에서 확인한다.** 앱을 완전히 껐다 켜서 해당 가챠에 이미지가 보이지 않는지 본다. 이미 켜 둔 앱은 데이터를 다시 받기 전까지 이미지가 남을 수 있다. 앱 빌드나 EAS Update 는 필요 없다.
6. **되살아나지 않게 한다.** 아래 [다시 올라오지 않게](#다시-올라오지-않게)를 따른다.
7. **회신하고 알린다.** 4 · 5번이 끝난 뒤 요청자에게 처리 결과를 답하고, 팀 채팅에 범위와 `takedown_batch` 를 남긴다.
8. **스토어 지적 · 전체 내림이면** ADR 0005 를 대체할 ADR 을 쓴다.

## 다시 올라오지 않게

`supabase/catalog/legacy-60.sql` 은 라인업을 지우고 다시 넣으므로, 그대로 다시 실행하면 내린 URL 이 돌아온다.

1. 내린 가챠의 라인업에서 `supabase/catalog/legacy-60.json` 의 `imageLink` 를 `null` 로 바꾼다. `collect` 를 다시 돌리면 JSON 이 새로 만들어져 `null` 이 사라지므로, 그 뒤에도 이 단계를 다시 한다.
2. `pnpm --filter @deckodecko/catalog-seed sql` 로 SQL 을 다시 만들고 PR 로 올린다.

`gacha.image_link` 는 이 파일이 넣지 않지만, 레거시 데이터를 prod 에 다시 넣는 작업이 있으면 그 전에 아래 목록과 대조한다.

```sql
select t.source_table, t.row_id, t.gacha_id, t.previous_image_link, r.reason, r.note, r.created_at
from public.image_takedowns t
join public.image_takedown_requests r on r.batch_id = t.batch_id
where r.restored_at is null
order by r.created_at desc;
```

## 되돌리기

요청이 잘못되었거나 사용 허락을 받았을 때만 한다.

```sql
select * from public.restore_images('<takedown_batch>');
```

| 결과           | 뜻                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `gacha_rows`   | 되살린 가챠 이미지 수                                                                                  |
| `item_rows`    | 되살린 라인업 이미지 수                                                                                |
| `skipped_rows` | 다른 유효한 요청에 걸려 비워 둔 수. 그 요청까지 되돌리면 그때 돌아온다                                 |
| `missing_rows` | 행을 찾지 못한 수. `legacy-60.sql` 재실행으로 `gacha_items` id 가 바뀐 경우다. 아래 JSON 복원으로 처리 |

내린 뒤 새 URL 을 넣은 행은 덮어쓰지 않는다. 같은 요청은 두 번 되돌릴 수 없다.

[다시 올라오지 않게](#다시-올라오지-않게)에서 JSON 을 `null` 로 바꿨다면 같은 URL 로 되돌리고 SQL 을 다시 만들어 PR 로 올린다. 안 그러면 다음 재실행 때 라인업 이미지가 다시 사라진다. 이전 URL 은 아래로 찾는다.

```sql
select gacha_id, row_id, previous_image_link
from public.image_takedowns
where batch_id = '<takedown_batch>' and source_table = 'gacha_items';
```

## 한계

- 이미지 원본은 반다이 CDN 에 있다. 이 절차는 앱이 그 주소를 쓰지 않게 할 뿐 원본을 지우지는 못한다.
- 이미지가 없으면 그 자리는 빈 칸으로 보인다.

## 연락처를 바꿀 때

스토어 등록 정보(App Store · Google Play), `apps/mobile/app/settings.tsx` 의 `CONTACT_EMAIL`, 이 문서를 함께 고친다. 앱 안의 주소는 새 빌드를 내야 바뀐다.
