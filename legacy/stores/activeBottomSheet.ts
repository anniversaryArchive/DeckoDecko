import { create } from "zustand";

type TSheetName = "BOOKMARK" | "FOLDER";

interface IBottomSheetState {
  // 현재 열려있는 시트들의 스택
  sheetStack: TSheetName[];
  // 스택에 새 시트를 추가하는 함수
  openSheet: (sheetName: TSheetName) => void;
  // 스택에서 마지막 시트를 제거하는 함수
  closeSheet: () => void;
}

export const activeBottomSheet = create<IBottomSheetState>((set) => ({
  sheetStack: [], // 초기 상태는 비어있는 배열

  openSheet: (sheetName) =>
    set((state) => ({
      // 기존 스택에 새로운 시트 이름을 추가(push)
      sheetStack: [...state.sheetStack, sheetName],
    })),

  closeSheet: () =>
    set((state) => ({
      // 배열의 마지막 요소를 제거(pop)
      sheetStack: state.sheetStack.slice(0, -1),
    })),
}));
