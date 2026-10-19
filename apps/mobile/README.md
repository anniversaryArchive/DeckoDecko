# @deckodecko/mobile

가챠 탐색대 Expo 앱 (SDK 57, expo-router).

```bash
pnpm --filter @deckodecko/mobile dev      # expo start
pnpm --filter @deckodecko/mobile ios      # iOS 시뮬레이터
pnpm --filter @deckodecko/mobile android  # Android 에뮬레이터
pnpm --filter @deckodecko/mobile run doctor   # expo-doctor 로 의존성 버전 점검 (run 을 빼면 pnpm 자체의 doctor 명령이 실행됨)
pnpm --filter @deckodecko/mobile exec expo start --web   # 브라우저에서 빠르게 확인 (출시 대상 아님)
```

- CI 는 `doctor`(버전 비교 제외)와 `EXPO_OFFLINE=1 expo install --check`(lockfile 의 expo 기준 버전 비교)로 막는다. 버전 검사가 실패하면 `pnpm --filter @deckodecko/mobile exec expo install --fix` 로 맞춘다.
- 주간 workflow(`.github/workflows/expo-weekly-update.yml`)가 매주 월요일 09:00(KST) Expo SDK 권장 패치를 확인하고, 뒤처졌으면 `expo install --fix` 결과로 PR 을 연다.
- `app/(tabs)/` 홈 · 내 굿즈 · 검색 탭, `app/gacha/[id].tsx` 상세 스택.
- 아이콘·스플래시·글꼴은 여경이 `packages/ui` 작업과 함께 붙인다. 디자인 토큰은 `@deckodecko/ui` 에서 가져온다.

## 문구 (i18n)

1. 화면에 보이는 글자는 `lib/i18n/ko.ts` 에 키를 먼저 만들고 `en.ts` 에 같은 키를 채운다. 한쪽만 있으면 타입 오류가 난다.
2. 키는 `화면.요소` (`home.title`, `detail.notFound`). 여러 화면이 같이 쓰면 `common` 에 둔다.
3. 화면에서는 `const { t } = useTranslation()` 후 `t("home.title")`. 값은 `{{id}}` 로 넣는다 (`t("detail.notFound", { id })`).
4. 가격 · 날짜 · 개수는 문구에 단위를 직접 붙이지 않고 `formatPrice` · `formatMonth` · `formatDate` · `formatItemCount` (`@/lib/i18n`) 를 쓴다.
5. 기기 언어가 지원 언어(ko · en)에 없으면 en 으로 보인다 (앱 이름과 같은 규칙: ko 만 한국어). 앱을 쓰는 중에 기기 언어를 바꾸면 바로 따라간다.

## 로컬 DB

WISH / GET 기록(items · folders)은 기기 안 SQLite(`deckodecko.db`)에 둔다. drizzle + expo-sqlite. 백오피스는 이 데이터를 읽지 않으므로 core 가 아니라 앱에 둔다 (`docs/adr/0002-monorepo-boundaries.md`).

| 경로                                           | 내용                                                       |
| ---------------------------------------------- | ---------------------------------------------------------- |
| `lib/db/schema.ts`                             | 테이블 정의. 스키마는 여기서만 바꾼다                      |
| `lib/db/client.native.ts`                      | DB 연결 하나 (`db`). 외래 키 검사는 마이그레이션 뒤에 켠다 |
| `lib/db/useLocalDbMigrations.native.ts`        | 앱 시작 시 마이그레이션 실행. `app/_layout.tsx` 에서 호출  |
| `lib/db/client.ts` · `useLocalDbMigrations.ts` | 웹용 자리표시자. sqlite 를 번들에 넣지 않는다              |
| `drizzle/`                                     | drizzle-kit 생성물. 손으로 고치지 않는다 (커스텀 SQL 제외) |

```bash
pnpm --filter @deckodecko/mobile db:generate                            # schema.ts 를 바꾼 뒤 마이그레이션 생성
pnpm --filter @deckodecko/mobile exec drizzle-kit generate --custom --name <이름>   # 트리거 · 데이터처럼 drizzle 이 못 만드는 SQL
```

- 이미 나간 마이그레이션 파일은 고치지 않고 새 파일을 추가한다. 사용자 기기에는 적용된 기록이 남아 있다.
- `.sql` 은 Metro transformer(`metro.sql-transformer.js`)가 문자열 모듈로 바꾼다. `.sql` 을 고치면 Metro 가 알아서 다시 변환하므로 캐시를 지울 필요가 없다.
- 기본 폴더는 `0001_default_folder.sql` 이 만든다. id 는 기기마다 다른 UUID 이므로 **`is_default` 로 찾는다** (id 를 가정하지 않는다). 삭제는 트리거가 막고, 표시 이름은 i18n 키로 정한다 (`name` 은 빈 문자열).
- 외래 키 검사(`PRAGMA foreign_keys`)는 마이그레이션이 끝난 뒤 켠다. 마이그레이터가 트랜잭션 안에서 돌아 그 안의 `PRAGMA foreign_keys = OFF` 가 무시되므로, 켠 채로 돌리면 drizzle-kit 의 테이블 재생성(`DROP TABLE`)이 실패한다.
- CHECK 같은 SQL 조각에는 `${t.col}` 대신 컬럼 이름만 쓴다. 테이블 이름이 붙으면 재생성할 때 `__new_*` 테이블에서 실패한다.
- 트리거처럼 본문에 `;` 가 있는 문장은 `--> statement-breakpoint` 로 자르지 않는다. 마이그레이터는 조각마다 첫 문장만 실행한다.
- `is_default` 는 넣은 뒤 바꿀 수 없다 (트리거). 플래그를 먼저 끄고 지우는 우회를 막는다.
- 일반 폴더를 지우면 그 안의 기록(items)은 지워지지 않고 기본 폴더로 옮겨진다 (트리거, `updated_at` 도 갱신). `folder_id` 는 `ON DELETE RESTRICT` 라 옮기지 못하면 폴더 삭제가 실패한다.
- 웹(`expo start --web`)에서는 로컬 DB 가 없다. 웹 expo-sqlite 는 COOP/COEP 헤더가 필요한데 dev 서버의 `/` 응답에 붙일 수 없어서다. 마이그레이션 훅은 실패를 돌려주고, `db` 에 접근하면 에러가 난다. 로컬 DB 를 쓰는 화면은 웹에서 이 경우를 처리한다.
- 시각은 ISO 8601 UTC 텍스트, id 는 text UUID. `created_at` · `updated_at` 은 INSERT 때만 기본값이 들어간다. 수정할 때는 저장소에서 `updated_at` 을 직접 넣는다.

## TODO

- [ ] `app.json` 에 `icon`, `splash`(배경 `#FFF9F4`), Android `adaptiveIcon` 추가 — 로고 SVG 를 1024px PNG 로 내보내 사용 (여경)
