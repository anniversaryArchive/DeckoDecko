# tools/catalog-seed

dev 에 이미 있는 레거시 가챠 60개에 라인업(`gacha_items`) · 발매월 · 공식 가격을 채우는 일회성 스크립트.
앱 코드와 분리되어 있고, 결과물은 `supabase/catalog/legacy-60.{json,sql}` 이다.

## 무엇을 하나

1. **collect**: dev 에서 작품이 연결된 레거시 가챠를 읽고(`supabase db query`, 읽기만), gashapon.jp 월별 일정 페이지와
   반다이 상품 ID(이미지 URL 의 `/model/b/<ID>_1.jpg`)로 짝짓는다. 최근 발매 순으로 **작품당 하나씩** 60개를 골라
   상세 페이지에서 발매월 · 가격 · 종수 · 라인업(이름 · 이미지 URL)을 뽑는다. 라인업 수가 `全N種` 과 다르면 건너뛴다.
2. **번역**: 스크립트가 아니라 Claude Code 세션에서 한다. JSON 의 각 아이템 `nameKr` 를 채우게 시킨다
   (작품 고유명사는 한국 정식 명칭, 없으면 원음 한글 표기, 영어 · 숫자는 그대로). 채운 뒤 사람이 훑어본다.
3. **sql**: JSON 에서 SQL 을 만든다. JSON 의 `nameKr` 를 손으로 고쳤다면 이 단계만 다시 돌린다.

요청 사이를 1초씩 띄우고, 상품 ID 를 짝지을 수 있는 공식 페이지만 읽는다.

## 실행

macOS · Linux 기준이다. Windows 에서는 `collect` 가 `pnpm.cmd` 를 찾지 못한다.

```bash
pnpm exec supabase login                                    # 처음 한 번 (팀 공용 계정)
pnpm --filter @deckodecko/catalog-seed collect              # → supabase/catalog/legacy-60.json
# → Claude Code 세션에서 legacy-60.json 의 nameKr 채우기
pnpm --filter @deckodecko/catalog-seed sql                  # → supabase/catalog/legacy-60.sql
```

`collect` 옵션: `--count 60`, `--from 202501 --to 202511` (일정 페이지 범위, YYYYMM), `--project-ref <ref>` (기본 dev).

## dev 적용

리뷰가 끝난 SQL 만 적용한다. 파일 전체가 한 트랜잭션이라 중간에 실패하면 아무것도 바뀌지 않고, 다시 실행해도 결과가 같다.
대신 대상 가챠의 라인업은 지우고 다시 넣으므로, 적용 뒤 dev 에서 직접 고친 라인업 · 발매월 · 가격은 다시 실행하면 사라진다.

```bash
pnpm exec supabase db query --linked -f supabase/catalog/legacy-60.sql
```

적용 뒤 확인:

```sql
select count(distinct gacha_id) from gacha_items;  -- 60
select count(*) from gacha                          -- 0 (작품 칩 · 발매월이 빠진 가챠 없음)
where id in (select gacha_id from gacha_items) and (anime_id is null or release_month is null);
```

## 이미지

`gacha_items.image_link` 에는 공식 사이트의 라인업 이미지 URL(반다이 CDN)을 그대로 넣고, prod 에도 그대로 쓴다.
복사하지 않으므로 원본 주소가 바뀌면 이미지가 깨진다. 이유와 감수하는 위험은 [ADR 0005](../../docs/adr/0005-official-lineup-images.md).
