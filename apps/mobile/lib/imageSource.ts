/** 출처를 표시해야 하는 이미지 제공처. 문구는 i18n `common.imageSource.<값>` */
export type ImageSource = "bandai";

/** 이미지 주소의 호스트 → 제공처. 카탈로그에 새 제공처의 이미지를 넣으면 여기와 i18n 문구를 같이 늘린다 (ADR 0005). */
const SOURCE_BY_HOST: Readonly<Record<string, ImageSource>> = {
  "bandai-a.akamaihd.net": "bandai",
};

/** 이미지 주소의 제공처. 표에 없는 호스트(개발용 자리 표시 이미지 · 내 사진 등)나 잘못된 주소는 null. */
export function imageSource(url: string | null | undefined): ImageSource | null {
  if (!url) return null;
  const host = /^https?:\/\/([^/?#:]+)/i.exec(url)?.[1]?.toLowerCase();
  return (host && SOURCE_BY_HOST[host]) || null;
}

/** 화면에 보이는 이미지 주소들의 제공처를 겹치지 않게, 처음 나온 순서로. */
export function imageSources(urls: readonly (string | null | undefined)[]): ImageSource[] {
  const found = new Set<ImageSource>();
  for (const url of urls) {
    const source = imageSource(url);
    if (source) found.add(source);
  }
  return [...found];
}
