import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

/** 내 굿즈. WISH / GET 목록, 폴더 필터, 묶어보기가 여기에 온다. */
export default function GoodsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("goods.title")} description={t("goods.empty")} />;
}
