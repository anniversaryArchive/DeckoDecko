-- 대시보드에서 만든 레거시 테이블 · 버킷의 쓰기를 막는다 (#133 리뷰).
-- publishable key 는 앱 번들과 EAS 환경변수로 퍼지므로, 그 키(anon)로는 읽기만 되게 한다.
-- 테이블 구조 정리와 정식 RLS 는 #114 · #115 에서 다시 만든다.

-- gacha: RLS 를 켜고 읽기만 허용
ALTER TABLE public.gacha ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gacha_select_all" ON public.gacha FOR SELECT TO anon, authenticated USING (true);

-- anime: RLS 는 켜져 있었지만 정책이 없어 조회가 항상 빈 결과였다
CREATE POLICY "anime_select_all" ON public.anime FOR SELECT TO anon, authenticated USING (true);

-- 클라이언트 역할의 쓰기 권한 회수 (백오피스 쓰기는 secret key 로 서버에서만)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON public.gacha, public.anime FROM anon, authenticated;
REVOKE UPDATE, USAGE ON SEQUENCE public.anime_id_seq FROM anon, authenticated;

-- profile 버킷: 소유자 확인 없이 anon 이 아무 파일이나 고치고 지울 수 있던 정책 제거
DROP POLICY IF EXISTS "anonymous_user_crud 1twvzjd_2" ON storage.objects;
DROP POLICY IF EXISTS "anonymous_user_crud 1twvzjd_3" ON storage.objects;
