import { describe, expect, it } from "vitest";

import { en } from "./en";
import { ko } from "./ko";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [[prefix + key, value]] : flatten(value, `${prefix}${key}.`)
  );
}

/** 문구 안의 {{변수}} 와 <태그> 이름. 언어마다 순서는 달라도 되니 정렬해서 비교한다. */
function slots(text: string): string[] {
  const vars = [...text.matchAll(/\{\{\s*(\w+)/g)].map((m) => `{{${m[1]}}}`);
  const tags = [...text.matchAll(/<\/?(\w+)\s*\/?>/g)].map((m) => `<${m[1]}>`);
  return [...vars, ...tags].sort();
}

const koEntries = new Map(flatten(ko));
const enEntries = flatten(en);

describe("en 문구", () => {
  it.each(enEntries)("%s 는 비어 있지 않고 한글이 없다", (_key, text) => {
    expect(text.trim()).not.toBe("");
    expect(text).not.toMatch(/[가-힣ㄱ-ㆎ]/);
  });

  it.each(enEntries)("%s 는 ko 와 같은 변수 · 태그를 쓴다", (key, text) => {
    expect(slots(text)).toEqual(slots(koEntries.get(key) ?? ""));
  });
});
