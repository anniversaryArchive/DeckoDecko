import type { LocalRepositories } from ".";
import type { Folder, Item } from "../types";
import type { ListItemsParams } from "./items";
import { cleanName, normalizeName } from "../name";

/**
 * 메모리 안에서 도는 items · folders 저장소. 훅 테스트와 웹 미리보기(로컬 DB 가 없음)에 쓴다.
 * 폴더 삭제 시 기록을 기본 폴더로 옮기는 것처럼, 앱 로컬 DB 의 제약 · 트리거와 같게 동작한다.
 * 기록과 폴더가 서로를 참조하므로 두 저장소를 한 번에 만든다.
 */
export function createMemoryLocalRepositories(): LocalRepositories {
  let seq = 0;
  const newId = () => `local-${++seq}`;
  const now = () => new Date().toISOString();

  // 배열 순서 = 추가한 순서. 같은 밀리초에 여러 건이 들어와도 순서가 정해지도록 시각이 아니라 이것으로 정렬한다.
  let items: Item[] = [];
  const folders: Folder[] = [
    { id: newId(), name: "", sequence: 0, isDefault: true, createdAt: now() },
  ];

  const defaultFolder = () => folders.find((f) => f.isDefault)!;
  const requireFolder = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    if (!folder) throw new Error(`folder not found: ${id}`);
    return folder;
  };
  const matches = (item: Item, p: ListItemsParams = {}) =>
    (p.gachaId === undefined || item.gachaId === p.gachaId) &&
    (p.type === undefined || item.type === p.type) &&
    (p.folderId === undefined || item.folderId === p.folderId);

  return {
    items: {
      async listItems(params) {
        return items
          .filter((i) => matches(i, params))
          .reverse()
          .map((i) => ({ ...i }));
      },

      async getItem(id) {
        const item = items.find((i) => i.id === id);
        return item ? { ...item } : null;
      },

      async countItems(params) {
        const hits = items.filter((i) => matches(i, params));
        return {
          wish: hits.filter((i) => i.type === "WISH").length,
          get: hits.filter((i) => i.type === "GET").length,
        };
      },

      async createItem(input) {
        const folderId = input.folderId ?? defaultFolder().id;
        requireFolder(folderId);
        const at = now();
        const item: Item = {
          id: newId(),
          gachaId: input.gachaId,
          folderId,
          type: input.type,
          name: cleanName(input.name),
          thumbnail: input.thumbnail ?? null,
          memo: input.memo ?? null,
          createdAt: at,
          updatedAt: at,
        };
        items.push(item);
        return { ...item };
      },

      async updateItem(id, input) {
        const index = items.findIndex((i) => i.id === id);
        const current = items[index];
        if (!current) throw new Error(`item not found: ${id}`);
        if (input.folderId !== undefined) requireFolder(input.folderId);
        // { folderId: undefined } 처럼 값이 undefined 인 키는 "안 바꿈"으로 본다
        const patch = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
        const next: Item = {
          ...current,
          ...patch,
          name: input.name === undefined ? current.name : cleanName(input.name),
          updatedAt: now(),
        };
        items[index] = next;
        return { ...next };
      },

      async deleteItem(id) {
        items = items.filter((i) => i.id !== id);
      },

      async isItemNameTaken({ gachaId, name, excludeId }) {
        const target = normalizeName(name);
        return items.some(
          (i) => i.gachaId === gachaId && i.id !== excludeId && normalizeName(i.name) === target
        );
      },
    },

    folders: {
      async listFolders() {
        return [...folders].sort((a, b) => a.sequence - b.sequence).map((f) => ({ ...f }));
      },

      async createFolder(name) {
        const folder: Folder = {
          id: newId(),
          name: cleanName(name),
          sequence: Math.max(...folders.map((f) => f.sequence)) + 1,
          isDefault: false,
          createdAt: now(),
        };
        folders.push(folder);
        return { ...folder };
      },

      async renameFolder(id, name) {
        const folder = requireFolder(id);
        if (folder.isDefault) throw new Error("The default folder cannot be renamed");
        folder.name = cleanName(name);
        return { ...folder };
      },

      async deleteFolder(id) {
        const index = folders.findIndex((f) => f.id === id);
        const folder = folders[index];
        if (!folder) return;
        if (folder.isDefault) throw new Error("The default folder cannot be deleted");
        const fallback = defaultFolder().id;
        const at = now();
        items = items.map((i) =>
          i.folderId === id ? { ...i, folderId: fallback, updatedAt: at } : i
        );
        folders.splice(index, 1);
      },

      async isFolderNameTaken(name, excludeId) {
        const target = normalizeName(name);
        return folders.some((f) => f.id !== excludeId && normalizeName(f.name) === target);
      },
    },
  };
}
