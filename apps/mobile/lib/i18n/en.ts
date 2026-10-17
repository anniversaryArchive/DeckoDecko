import type { Messages } from "./types";

/** 영어 문구. ko.ts 와 키 모양이 같아야 한다 (빠지거나 남는 키가 있으면 타입 오류). */
export const en: Messages = {
  common: {
    loading: "Loading…",
    loadFailed: "Couldn't load",
    retry: "Try again",
    price: "¥{{value, number}}",
    itemCount_one: "{{count}} item",
    itemCount_other: "{{count}} items",
    appName: "DeckoDecko",
    back: "Back",
    last10Days: "Last 10 days",
    pricePerPlay: "{{price}} per play",
    taxIncluded: "(tax incl.)",
    released: "Out {{month}}",
    itemTotal: "{{total}} total",
  },
  home: {
    title: "Home",
    collectionRate: "My collection",
    newArrivals: "New arrivals",
    newBadge: "NEW",
    popular: "Trending now",
    empty: "No gacha yet.",
  },
  search: {
    title: "Search",
    placeholder: "Search by item or series",
    submit: "Search",
    clear: "Clear search",
    popularTitle: "Popular searches",
    resultCount_one: "<bold>{{count, number}}</bold> result",
    resultCount_other: "<bold>{{count, number}}</bold> results",
    noResult: "No results for '{{keyword}}'",
    noResultHint: "Try part of the title or item name.\nThis gacha may not be listed yet.",
  },
  detail: {
    title: "Gacha details",
    notFound: "This gacha doesn't exist (id: {{id}})",
  },
  goods: {
    title: "My Goods",
    empty: "No saved gacha yet.",
  },
  folder: {},
  notice: {},
  settings: {},
  feedback: {},
};
