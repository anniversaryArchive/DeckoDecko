import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

/** 검색. 최근 검색어 · 최근 본 굿즈 · 인기가 여기에 온다. */
export default function SearchScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("search.title")} description={t("search.placeholder")} />;
}
