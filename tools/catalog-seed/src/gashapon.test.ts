import { describe, expect, it } from "vitest";

import { decodeHtml, modelIdFromImageLink, parseDetail, parseSchedule } from "./gashapon.ts";

const IMG = "https://bandai-a.akamaihd.net/bc/img/model";

const schedule = `
<div class="c-card__list"><a class="c-card__link" href="../products/detail.php?jan_code=4570000000001000" alt="A">
  <p class="c-card__thumb"><img loading="lazy" src="${IMG}/b/1000000001_1.jpg" alt=""></p>
  <p class="c-card__name">ねこ &amp; いぬ マスコット</p></a></div>
<div class="c-card__list"><a class="c-card__link" href="../products/detail.php?jan_code=4570000000002000" alt="B">
  <p class="c-card__thumb"><img loading="lazy" src="${IMG}/b/1000000002_1.jpg" alt=""></p>
  <p class="c-card__name">ほしの チャーム</p></a></div>`;

function detail({ count = "全3種", release = " 2025年8月 第1週 <br /> " } = {}): string {
  return `
<h1 class="pg-heading"> ねこ マスコット </h1>
<div class="pg-detail__picture js-swiper" data-swiper="main"><ul class="swiper-wrapper">
  <li><img loading="lazy" src="${IMG}/xl/1000000001_1.jpg" title="" alt=""></li>
  <li><img loading="lazy" src="${IMG}/xl/1000000001_2.jpg" title="しろねこ" alt=""></li>
  <li><img loading="lazy" src="${IMG}/xl/1000000001_3.jpg" title="くろねこ" alt=""></li>
  <li><img loading="lazy" src="${IMG}/xl/1000000001_4.jpg" title="みけねこ" alt=""></li>
</ul></div>
<div data-swiper="thumb"><ul><li><img src="${IMG}/xl/1000000001_2.jpg" title="しろねこ"></li></ul></div>
<dl class="pg-detailDefinition"><dt class="pg-detailDefinition__title">発売時期</dt>
  <dd class="pg-detailDefinition__detail --releaseDate">${release}</dd></dl>
<dl class="pg-detailDefinition"><dt class="pg-detailDefinition__title"> 価格(税込) </dt>
  <dd class="pg-detailDefinition__detail">1,000円</dd></dl>
<dl class="pg-detailDefinition"><dt class="pg-detailDefinition__title">種類数</dt>
  <dd class="pg-detailDefinition__detail">${count}</dd></dl>`;
}

describe("parseSchedule", () => {
  it("카드마다 jan_code · 상품 ID · 이름을 뽑는다", () => {
    expect(parseSchedule(schedule)).toEqual([
      { janCode: "4570000000001000", modelId: "1000000001", name: "ねこ & いぬ マスコット" },
      { janCode: "4570000000002000", modelId: "1000000002", name: "ほしの チャーム" },
    ]);
  });
});

describe("parseDetail", () => {
  it("발매월 · 가격 · 종수 · 메인 슬라이드 라인업을 뽑는다", () => {
    expect(parseDetail(detail())).toEqual({
      name: "ねこ マスコット",
      releaseMonth: "2025-08",
      price: 1000,
      itemCount: 3,
      items: [
        { name: "しろねこ", imageLink: `${IMG}/xl/1000000001_2.jpg` },
        { name: "くろねこ", imageLink: `${IMG}/xl/1000000001_3.jpg` },
        { name: "みけねこ", imageLink: `${IMG}/xl/1000000001_4.jpg` },
      ],
    });
  });

  it("종수가 없으면 이유를 담아 던진다", () => {
    expect(() => parseDetail(detail({ count: "-" }))).toThrow("種類数");
  });

  it("발매 시기에 월이 없으면 던진다", () => {
    expect(() => parseDetail(detail({ release: "近日発売" }))).toThrow("発売時期");
  });
});

describe("helpers", () => {
  it("이미지 URL 에서 상품 ID 를 꺼낸다", () => {
    expect(modelIdFromImageLink(`${IMG}/b/1000235900_1.jpg`)).toBe("1000235900");
    expect(modelIdFromImageLink("https://example.com/a.png")).toBeNull();
  });

  it("숫자 · 이름 엔티티를 푼다", () => {
    expect(decodeHtml("&#12354;&#x3044;&amp;&unknown;")).toBe("あい&&unknown;");
  });
});
