/** gashapon.jp 일정 · 상세 페이지 HTML 파서. 네트워크 없이 문자열만 다룬다. */

export const GASHAPON_ORIGIN = "https://gashapon.jp";

export interface ScheduleCard {
  janCode: string;
  /** 반다이 상품 ID. 이미지 URL(`/bc/img/model/b/<ID>_1.jpg`)에 들어 있어 레거시 gacha.image_link 와 짝짓는 데 쓴다. */
  modelId: string;
  name: string;
}

export interface DetailItem {
  name: string;
  imageLink: string;
}

export interface Detail {
  name: string;
  /** "YYYY-MM" */
  releaseMonth: string;
  price: number;
  itemCount: number;
  items: DetailItem[];
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeHtml(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      return String.fromCodePoint(parseInt(code.slice(2), 16));
    }
    if (code.startsWith("#")) return String.fromCodePoint(parseInt(code.slice(1), 10));
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

function cleanText(html: string): string {
  return decodeHtml(html.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

export function modelIdFromImageLink(link: string): string | null {
  return /\/model\/[a-z]+\/(\d+)_\d+\.jpg/.exec(link)?.[1] ?? null;
}

export function scheduleUrl(ym: string): string {
  return `${GASHAPON_ORIGIN}/schedule/?ym=${ym}`;
}

export function detailUrl(janCode: string): string {
  return `${GASHAPON_ORIGIN}/products/detail.php?jan_code=${janCode}`;
}

export function parseSchedule(html: string): ScheduleCard[] {
  const cards: ScheduleCard[] = [];
  const cardRe = /<a class="c-card__link" href="[^"]*detail\.php\?jan_code=(\d+)"[\s\S]*?<\/a>/g;
  for (const match of html.matchAll(cardRe)) {
    const [block, janCode] = match;
    const modelId = /\/model\/b\/(\d+)_1\.jpg/.exec(block)?.[1];
    const name = /<p class="c-card__name">([\s\S]*?)<\/p>/.exec(block)?.[1];
    if (!janCode || !modelId || name === undefined) continue;
    cards.push({ janCode, modelId, name: cleanText(name) });
  }
  return cards;
}

/** 상세 페이지 정의 목록(발売時期 · 価格 · 種類数)에서 제목이 `title` 로 시작하는 항목의 값. */
function definition(html: string, title: string): string | null {
  const re =
    /pg-detailDefinition__title">([\s\S]*?)<\/[a-z]+>\s*<[a-z]+ class="pg-detailDefinition__detail[^"]*">([\s\S]*?)<\/[a-z]+>/g;
  for (const [, key = "", value = ""] of html.matchAll(re)) {
    if (cleanText(key).startsWith(title)) return cleanText(value);
  }
  return null;
}

/**
 * 상세 페이지에서 라인업까지 뽑는다. 필요한 값이 하나라도 없으면 이유를 담아 던진다.
 * 라인업은 메인 슬라이드의 이미지 title 이다 (첫 장은 전체 사진이라 title 이 비어 있다).
 */
export function parseDetail(html: string): Detail {
  const heading = /<h1 class="pg-heading">([\s\S]*?)<\/h1>/.exec(html)?.[1];
  if (heading === undefined) throw new Error("상품명 없음");

  const release = /(\d{4})年\s*(\d{1,2})月/.exec(definition(html, "発売時期") ?? "");
  if (!release?.[1] || !release[2]) throw new Error("発売時期 없음");
  const releaseMonth = `${release[1]}-${release[2].padStart(2, "0")}`;

  const price = /([\d,]+)円/.exec(definition(html, "価格") ?? "")?.[1];
  if (!price) throw new Error("価格 없음");

  const count = /全\s*(\d+)\s*種/.exec(definition(html, "種類数") ?? "")?.[1];
  if (!count) throw new Error("種類数 없음");

  const gallery = /data-swiper="main">([\s\S]*?)<\/ul>/.exec(html)?.[1] ?? "";
  const items: DetailItem[] = [];
  const seen = new Set<string>();
  for (const [img] of gallery.matchAll(/<img\b[^>]*>/g)) {
    const src = /\bsrc="([^"]+)"/.exec(img)?.[1];
    const title = cleanText(/\btitle="([^"]*)"/.exec(img)?.[1] ?? "");
    if (!src || !title || seen.has(title)) continue;
    seen.add(title);
    items.push({ name: title, imageLink: src });
  }

  return {
    name: cleanText(heading),
    releaseMonth,
    price: Number(price.replace(/,/g, "")),
    itemCount: Number(count),
    items,
  };
}
