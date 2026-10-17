import { repositories } from "@/lib/repositories";

/**
 * 백오피스 첫 화면. 카탈로그 목록 · 공지 작성 · 아이템 이미지 업로드 메뉴가 여기에 붙는다.
 * 서버 컴포넌트라 훅 없이 저장소를 직접 await 한다 (@deckodecko/core 기본 엔트리에는 React 가 없다).
 */
export default async function HomePage() {
  const gachaList = await repositories.gacha.listGacha();
  return (
    <main>
      <h1>가챠 탐색대 백오피스</h1>
      <p>카탈로그 · 공지 · 아이템 이미지 관리 (뼈대)</p>
      <ul>
        {gachaList.map((gacha) => (
          <li key={gacha.id}>
            {gacha.nameKo ?? gacha.name} — {gacha.media?.title ?? "작품 없음"} ·{" "}
            {gacha.itemCount ?? 0}종
          </li>
        ))}
      </ul>
    </main>
  );
}
