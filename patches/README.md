# patches

`pnpm patch` 로 만든 라이브러리 패치. `pnpm-workspace.yaml` 의 `patchedDependencies` 에 적힌 것만 설치할 때 적용된다.
라이브러리 버전을 올리면 패치가 버전에 묶여 있어 설치가 실패한다. 그때 아래 "언제 지우나"를 보고 지우거나 새 버전에 다시 만든다.

## @gorhom/bottom-sheet 5.2.14

- **문제**: 시트 위에 시트를 띄우고(아이템 시트 → 폴더 선택) 위 시트를 닫으면 아래 시트까지 사라진다.
- **원인**: 위 시트를 띄울 때 아래 시트를 내려 두는데(`minimize`), 내려간 뒤 `onChange(-1)` 가 상태를 `MINIMIZED` 로 덮어쓴다.
  이어서 오는 `onClose` 는 `MINIMIZING` 만 "내려 둠"으로 보고 나머지는 닫힘으로 처리해 아래 시트를 unmount 한다.
- **패치**: `BottomSheetModal` 의 `handleBottomSheetOnChange` 에서 `MINIMIZING` · `DISMISSING` 이면 상태를 덮어쓰지 않는다 (src · lib 세 파일).
- **언제 지우나**: 새 버전에서 패치 없이 컴포넌트 카탈로그(`/dev/components`)의 시트 견본 → "폴더: …" → 뒤로를 눌러 아이템 시트가 다시 올라오면 지운다.

다시 만들 때: `pnpm patch @gorhom/bottom-sheet@<버전>` → 안내된 폴더에서 고치기 → `pnpm patch-commit <폴더>`.
`patch-commit` 이 `pnpm-workspace.yaml` 의 주석과 따옴표를 지우니 커밋 전에 되돌린다.
