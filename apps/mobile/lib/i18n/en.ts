import type { Messages } from "./types";

/** 영어 문구. ko.ts 와 키 모양이 같아야 한다 (빠지거나 남는 키가 있으면 타입 오류). */
export const en: Messages = {
  common: {
    loading: "Loading…",
    loadFailed: "Couldn't load",
    retry: "Try again",
    price: "¥{{value, number}}",
    itemCount_one: "{{count, number}} item",
    itemCount_other: "{{count, number}} items",
    back: "Back",
  },
  home: {
    title: "Home",
    description: "Collection · New arrivals · Popular now · Notices",
    collectionRate: "My collection",
    listFailed: "Couldn't load the list",
    missingGachaLink: "Open a missing gacha (empty state check)",
  },
  search: {
    title: "Search",
    placeholder: "Search by item or series",
  },
  detail: {
    title: "Gacha details",
    notFound: "This gacha doesn't exist (id: {{id}})",
  },
  goods: {
    title: "My Goods",
    empty: "No saved gacha yet.",
  },
  folder: {
    selectTitle: "Choose folder",
    defaultName: "Default",
    itemCount_one: "{{count, number}} item",
    itemCount_other: "{{count, number}} items",
    newFolder: "New folder",
    createLabel: "Create a folder",
    namePlaceholder: "Folder name",
    create: "Create",
    nameHint: "Folder names must be unique",
    nameTaken: "A folder with this name already exists",
    createFailed: "Couldn't create the folder",
  },
  notice: {},
  settings: {},
  feedback: {},
};
