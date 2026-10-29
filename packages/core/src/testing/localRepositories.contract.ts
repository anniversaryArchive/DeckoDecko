import { beforeEach, describe, expect, it } from "vitest";

import type { LocalRepositories } from "../repositories";

/**
 * items · folders 저장소가 지켜야 할 동작. 앱의 drizzle 구현과 core 의 메모리 구현이 같은 테스트를 돌려 동작을 맞춘다.
 * create 는 테스트마다 새 저장소(기본 폴더 하나만 있는 상태)를 돌려준다.
 */
export function describeLocalRepositories(
  name: string,
  create: () => LocalRepositories | Promise<LocalRepositories>
) {
  describe(name, () => {
    let repos: LocalRepositories;

    beforeEach(async () => {
      repos = await create();
    });

    const ids = (list: { id: string }[]) => list.map((x) => x.id);

    async function defaultFolder() {
      const folder = (await repos.folders.listFolders()).find((f) => f.isDefault);
      if (!folder) throw new Error("default folder missing");
      return folder;
    }

    describe("items", () => {
      it("추가하면 기본 폴더에 들어가고, 이름은 앞뒤 공백을 뺀다", async () => {
        const item = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "  토끼 " });
        expect(item).toMatchObject({
          gachaId: "g1",
          type: "WISH",
          name: "토끼",
          folderId: (await defaultFolder()).id,
          thumbnail: null,
          memo: null,
        });
        expect(item.createdAt).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
        expect(item.updatedAt).toBe(item.createdAt);
        expect(await repos.items.getItem(item.id)).toEqual(item);
      });

      it("폴더 · 사진 · 메모를 넣어 추가할 수 있다", async () => {
        const folder = await repos.folders.createFolder("가방");
        const item = await repos.items.createItem({
          gachaId: "g1",
          type: "GET",
          name: "a",
          folderId: folder.id,
          thumbnail: "file:///a.jpg",
          memo: "메모",
        });
        expect(item).toMatchObject({
          folderId: folder.id,
          thumbnail: "file:///a.jpg",
          memo: "메모",
        });
      });

      it("빈 이름은 저장하지 않는다", async () => {
        await expect(
          repos.items.createItem({ gachaId: "g1", type: "WISH", name: "  " })
        ).rejects.toThrow();
        expect(await repos.items.listItems()).toEqual([]);
      });

      it("없는 폴더로는 저장하지 않는다 (에러를 그대로 올린다)", async () => {
        await expect(
          repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a", folderId: "nope" })
        ).rejects.toThrow();
        expect(await repos.items.listItems()).toEqual([]);
      });

      it("가챠 하나에 여러 개를 저장할 수 있다", async () => {
        await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        await repos.items.createItem({ gachaId: "g1", type: "GET", name: "b" });
        expect(await repos.items.listItems({ gachaId: "g1" })).toHaveLength(2);
      });

      it("목록은 최근에 추가한 것부터, 가챠 · 타입 · 폴더로 거른다 (조건은 AND)", async () => {
        const folder = await repos.folders.createFolder("가방");
        const a = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        const b = await repos.items.createItem({ gachaId: "g1", type: "GET", name: "b" });
        const c = await repos.items.createItem({
          gachaId: "g2",
          type: "GET",
          name: "c",
          folderId: folder.id,
        });

        expect(ids(await repos.items.listItems())).toEqual([c.id, b.id, a.id]);
        expect(ids(await repos.items.listItems({ gachaId: "g1" }))).toEqual([b.id, a.id]);
        expect(ids(await repos.items.listItems({ type: "GET" }))).toEqual([c.id, b.id]);
        expect(ids(await repos.items.listItems({ folderId: folder.id }))).toEqual([c.id]);
        expect(ids(await repos.items.listItems({ gachaId: "g1", type: "GET" }))).toEqual([b.id]);
        expect(await repos.items.listItems({ gachaId: "none" })).toEqual([]);
      });

      it("없는 id 를 읽으면 null", async () => {
        expect(await repos.items.getItem("nope")).toBeNull();
      });

      it("수정은 넘긴 필드만 바꾸고 updatedAt 을 갱신한다 (undefined 는 안 바꿈)", async () => {
        const item = await repos.items.createItem({
          gachaId: "g1",
          type: "WISH",
          name: "a",
          memo: "메모",
        });
        await new Promise((r) => setTimeout(r, 5));
        const updated = await repos.items.updateItem(item.id, { name: " b ", folderId: undefined });
        expect(updated).toMatchObject({ name: "b", memo: "메모", folderId: item.folderId });
        expect(updated.updatedAt > item.updatedAt).toBe(true);
        expect(updated.createdAt).toBe(item.createdAt);
        expect(await repos.items.getItem(item.id)).toEqual(updated);
      });

      it("다른 폴더로 옮길 수 있고, 없는 폴더로는 옮기지 않는다", async () => {
        const folder = await repos.folders.createFolder("가방");
        const item = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        expect((await repos.items.updateItem(item.id, { folderId: folder.id })).folderId).toBe(
          folder.id
        );
        await expect(repos.items.updateItem(item.id, { folderId: "nope" })).rejects.toThrow();
        expect((await repos.items.getItem(item.id))?.folderId).toBe(folder.id);
      });

      it("빈 이름으로는 수정하지 않는다", async () => {
        const item = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        await expect(repos.items.updateItem(item.id, { name: " " })).rejects.toThrow();
        expect((await repos.items.getItem(item.id))?.name).toBe("a");
      });

      it("WISH ↔ GET 전환", async () => {
        const item = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        expect((await repos.items.updateItem(item.id, { type: "GET" })).type).toBe("GET");
        expect((await repos.items.updateItem(item.id, { type: "WISH" })).type).toBe("WISH");
      });

      it("memo · thumbnail 을 null 로 지울 수 있다", async () => {
        const item = await repos.items.createItem({
          gachaId: "g1",
          type: "WISH",
          name: "a",
          memo: "m",
          thumbnail: "t",
        });
        expect(
          await repos.items.updateItem(item.id, { memo: null, thumbnail: null })
        ).toMatchObject({ memo: null, thumbnail: null });
      });

      it("없는 id 를 수정하면 던진다", async () => {
        await expect(repos.items.updateItem("nope", { name: "a" })).rejects.toThrow();
      });

      it("삭제. 없는 id 면 아무 일도 없다", async () => {
        const item = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        const other = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "b" });
        await repos.items.deleteItem(item.id);
        await repos.items.deleteItem("nope");
        expect(await repos.items.getItem(item.id)).toBeNull();
        expect(ids(await repos.items.listItems())).toEqual([other.id]);
      });

      it("개수: 전체 · 가챠별 WISH / GET", async () => {
        expect(await repos.items.countItems()).toEqual({ wish: 0, get: 0 });
        await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        await repos.items.createItem({ gachaId: "g1", type: "GET", name: "b" });
        await repos.items.createItem({ gachaId: "g2", type: "GET", name: "c" });
        expect(await repos.items.countItems()).toEqual({ wish: 1, get: 2 });
        expect(await repos.items.countItems({ gachaId: "g1" })).toEqual({ wish: 1, get: 1 });
        expect(await repos.items.countItems({ gachaId: "none" })).toEqual({ wish: 0, get: 0 });
      });

      it("폴더별 개수: WISH · GET 합, 기록이 없는 폴더는 빠진다", async () => {
        const fallback = (await defaultFolder()).id;
        const bag = await repos.folders.createFolder("가방");
        await repos.folders.createFolder("빈 폴더");
        expect(await repos.items.countItemsByFolder()).toEqual({});
        await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        await repos.items.createItem({ gachaId: "g1", type: "GET", name: "b", folderId: bag.id });
        await repos.items.createItem({ gachaId: "g2", type: "WISH", name: "c", folderId: bag.id });
        expect(await repos.items.countItemsByFolder()).toEqual({ [fallback]: 1, [bag.id]: 2 });
      });

      it("가챠별 개수: WISH / GET 따로, 기록이 없는 가챠는 빠진다", async () => {
        expect(await repos.items.countItemsByGacha()).toEqual({});
        await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "a" });
        await repos.items.createItem({ gachaId: "g1", type: "GET", name: "b" });
        await repos.items.createItem({ gachaId: "g1", type: "GET", name: "c" });
        await repos.items.createItem({ gachaId: "g2", type: "WISH", name: "d" });
        expect(await repos.items.countItemsByGacha()).toEqual({
          g1: { wish: 1, get: 2 },
          g2: { wish: 1, get: 0 },
        });
      });

      describe("이름 중복 검사", () => {
        it("같은 가챠 안에서만 본다", async () => {
          await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "토끼" });
          expect(await repos.items.isItemNameTaken({ gachaId: "g1", name: "토끼" })).toBe(true);
          expect(await repos.items.isItemNameTaken({ gachaId: "g2", name: "토끼" })).toBe(false);
        });

        it("WISH · GET 구분 없이 본다", async () => {
          await repos.items.createItem({ gachaId: "g1", type: "GET", name: "토끼" });
          expect(await repos.items.isItemNameTaken({ gachaId: "g1", name: "토끼" })).toBe(true);
        });

        it("앞뒤 공백 · 대소문자 · 전각은 같은 이름으로 본다", async () => {
          await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "Rabbit A" });
          for (const name of [" rabbit a ", "RABBIT A", "Ｒａｂｂｉｔ Ａ"]) {
            expect(await repos.items.isItemNameTaken({ gachaId: "g1", name }), name).toBe(true);
          }
          expect(await repos.items.isItemNameTaken({ gachaId: "g1", name: "RabbitA" })).toBe(false);
        });

        it("수정 중인 기록 자신은 뺀다", async () => {
          const item = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "토끼" });
          expect(
            await repos.items.isItemNameTaken({ gachaId: "g1", name: "토끼", excludeId: item.id })
          ).toBe(false);
        });

        it("지운 기록의 이름은 다시 쓸 수 있다", async () => {
          const item = await repos.items.createItem({ gachaId: "g1", type: "WISH", name: "토끼" });
          await repos.items.deleteItem(item.id);
          expect(await repos.items.isItemNameTaken({ gachaId: "g1", name: "토끼" })).toBe(false);
        });
      });
    });

    describe("folders", () => {
      it("처음에는 기본 폴더 하나 (sequence 0, 이름 비어 있음)", async () => {
        const list = await repos.folders.listFolders();
        expect(list).toHaveLength(1);
        expect(list[0]).toMatchObject({ isDefault: true, sequence: 0, name: "" });
      });

      it("추가하면 MAX(sequence)+1, 목록은 sequence 순", async () => {
        const a = await repos.folders.createFolder(" 가방 ");
        const b = await repos.folders.createFolder("책상");
        expect(a).toMatchObject({ name: "가방", sequence: 1, isDefault: false });
        expect(b.sequence).toBe(2);
        await repos.folders.deleteFolder(a.id);
        // 목록 길이(2)가 아니라 MAX+1(3)
        expect((await repos.folders.createFolder("서랍")).sequence).toBe(3);
        expect((await repos.folders.listFolders()).map((f) => f.sequence)).toEqual([0, 2, 3]);
      });

      it("빈 이름은 만들지 않는다", async () => {
        await expect(repos.folders.createFolder(" ")).rejects.toThrow();
        expect(await repos.folders.listFolders()).toHaveLength(1);
      });

      it("이름 변경. 앞뒤 공백을 빼고, sequence 는 그대로", async () => {
        const folder = await repos.folders.createFolder("가방");
        const renamed = await repos.folders.renameFolder(folder.id, " 책상 ");
        expect(renamed).toMatchObject({ id: folder.id, name: "책상", sequence: folder.sequence });
        expect((await repos.folders.listFolders())[1]?.name).toBe("책상");
      });

      it("기본 폴더 · 없는 id · 빈 이름으로는 이름을 바꾸지 않는다", async () => {
        const folder = await repos.folders.createFolder("가방");
        await expect(repos.folders.renameFolder((await defaultFolder()).id, "x")).rejects.toThrow(
          "The default folder cannot be renamed"
        );
        await expect(repos.folders.renameFolder("nope", "x")).rejects.toThrow("folder not found");
        await expect(repos.folders.renameFolder(folder.id, " ")).rejects.toThrow();
        expect((await repos.folders.listFolders()).map((f) => f.name)).toEqual(["", "가방"]);
      });

      it("삭제하면 폴더의 기록은 기본 폴더로 옮겨진다 (다른 폴더의 기록은 그대로)", async () => {
        const folder = await repos.folders.createFolder("가방");
        const other = await repos.folders.createFolder("책상");
        const moved = await repos.items.createItem({
          gachaId: "g1",
          type: "GET",
          name: "a",
          folderId: folder.id,
        });
        const kept = await repos.items.createItem({
          gachaId: "g1",
          type: "GET",
          name: "b",
          folderId: other.id,
        });
        await repos.folders.deleteFolder(folder.id);
        const fallback = (await defaultFolder()).id;
        expect(ids(await repos.folders.listFolders())).toEqual([fallback, other.id]);
        expect((await repos.items.getItem(moved.id))?.folderId).toBe(fallback);
        expect((await repos.items.getItem(kept.id))?.folderId).toBe(other.id);
      });

      it("기본 폴더는 지울 수 없다. 없는 id 는 아무 일도 없다", async () => {
        await expect(repos.folders.deleteFolder((await defaultFolder()).id)).rejects.toThrow();
        await repos.folders.deleteFolder("nope");
        expect(await repos.folders.listFolders()).toHaveLength(1);
      });

      it("이름 중복 검사 (공백 · 대소문자 무시, 수정 중인 폴더 자신은 뺀다)", async () => {
        const folder = await repos.folders.createFolder("Bag");
        expect(await repos.folders.isFolderNameTaken(" bag")).toBe(true);
        expect(await repos.folders.isFolderNameTaken("Bag", folder.id)).toBe(false);
        expect(await repos.folders.isFolderNameTaken("책상")).toBe(false);
      });
    });
  });
}
