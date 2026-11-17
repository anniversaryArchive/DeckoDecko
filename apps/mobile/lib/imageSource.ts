/** 출처를 표시해야 하는 이미지 제공처. 문구는 i18n `common.imageSource.<값>` */
export type ImageSource = "bandai";

/** 이미지 주소를 가진 것 (가챠 등). 아직 못 받은 항목은 null · undefined 로 넘겨도 된다 */
export type ImageItem = { imageUrl: string | null } | null | undefined;

/** 이미지 주소의 호스트 → 제공처. 카탈로그에 새 제공처의 이미지를 넣으면 여기와 i18n 문구를 같이 늘린다 (ADR 0005). */
const SOURCE_BY_HOST: Readonly<Record<string, ImageSource>> = {
  "bandai-a.akamaihd.net": "bandai",
};

/** 출처 표시가 필요 없는 걸 아는 호스트 (seed 의 자리 표시 이미지). 개발 중 누락 경고에서 뺀다 */
const NO_CREDIT_HOSTS: ReadonlySet<string> = new Set(["placehold.co"]);

const warnedHosts = new Set<string>();

/** 이미지 주소의 호스트. http(s) 로 시작하는 주소만 본다 (프로토콜 생략 · 앞쪽 공백 · 로컬 파일은 null) */
function hostOf(url: string): string | null {
  // new URL() 을 쓰지 않는다: RN 의 URL 은 부분 폴리필이라 테스트(Node)와 앱에서 결과가 달라질 수 있다
  return /^https?:\/\/([^/?#:]+)/i.exec(url)?.[1]?.toLowerCase() ?? null;
}

/** 이미지 주소의 제공처. 표에 없는 호스트(개발용 자리 표시 이미지 · 내 사진 등)나 잘못된 주소는 null. */
export function imageSource(url: string | null | undefined): ImageSource | null {
  if (!url) return null;
  const host = hostOf(url);
  if (!host) return null;
  const source = SOURCE_BY_HOST[host] ?? null;
  if (source == null) warnUnknownHost(host, url);
  return source;
}

/** 여러 목록에 보이는 이미지의 제공처를 겹치지 않게, 처음 나온 순서로. */
export function imageSources(lists: readonly (readonly ImageItem[] | undefined)[]): ImageSource[] {
  const found = new Set<ImageSource>();
  for (const list of lists) {
    for (const item of list ?? []) {
      const source = imageSource(item?.imageUrl);
      if (source) found.add(source);
    }
  }
  return [...found];
}

/** 개발 빌드에서 표에 없는 https 이미지 호스트를 호스트마다 한 번 알린다 (출처 표시 누락 방지). */
function warnUnknownHost(host: string, url: string) {
  if (typeof __DEV__ === "undefined" || !__DEV__) return;
  if (!/^https:/i.test(url) || NO_CREDIT_HOSTS.has(host) || warnedHosts.has(host)) return;
  warnedHosts.add(host);
  console.warn(
    `출처 표가 모르는 이미지 호스트: ${host}. 공식 이미지라면 lib/imageSource.ts 와 i18n common.imageSource 에 추가한다.`
  );
}
