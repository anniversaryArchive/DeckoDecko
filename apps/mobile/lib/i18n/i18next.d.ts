import "i18next";

import type { ko } from "./ko";

// t("home.title") 처럼 키를 타입으로 검사한다. 없는 키를 쓰면 타입 오류가 난다.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: typeof ko };
  }
}
