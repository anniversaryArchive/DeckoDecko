import { Redirect } from "expo-router";
import { useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";

import {
  border,
  gutter,
  radius,
  space,
  typography,
  useTheme,
  type ThemeColors,
  type TypographyName,
} from "@deckodecko/ui";
import {
  BottomSheet,
  Button,
  Card,
  ChevronDownIcon,
  Chip,
  Input,
  Segment,
  Text,
  type ButtonSize,
  type ButtonVariant,
} from "@deckodecko/ui/native";

/** 색 견본 한 칸의 크기 */
const SWATCH = 44;
/** 카드 견본 안 썸네일 크기 */
const THUMB = 64;

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "outline", "soft", "danger"];
const SIZES: ButtonSize[] = ["lg", "md", "sm"];

/**
 * 개발용 컴포넌트 카탈로그. 토큰과 공용 컴포넌트(@deckodecko/ui/native)를 한 화면에서 확인한다.
 * 개발 빌드에서만 열리고, 출시 빌드에서는 홈으로 보낸다.
 * 개발자만 보는 화면이라 문구는 i18n 을 거치지 않는다.
 */
export default function ComponentCatalog() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Catalog />;
}

function Catalog() {
  const { colors, name } = useTheme();
  const [filter, setFilter] = useState("all");
  const [folder, setFolder] = useState("all");
  const [status, setStatus] = useState<"wish" | "get">("wish");
  const [tab, setTab] = useState<"wish" | "get">("get");
  const [itemName, setItemName] = useState("토끼 (당근 바구니)");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: gutter, gap: space[32] }}
    >
      <Text color="textMuted">테마: {name}</Text>

      <Section title="색 역할" note="useTheme().colors">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[12] }}>
          {(Object.keys(colors) as (keyof ThemeColors)[]).map((k) => (
            <View key={k} style={{ width: SWATCH * 2, gap: space[4] }}>
              <View
                style={{
                  width: SWATCH,
                  height: SWATCH,
                  borderRadius: radius.thumb,
                  borderWidth: border.divider,
                  borderColor: colors.line,
                  backgroundColor: colors[k],
                }}
              />
              <Text variant="captionSm" color="textMuted" numberOfLines={1}>
                {k}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="글자" note="Text variant">
        {(Object.keys(typography) as TypographyName[]).map((k) => (
          <View key={k} style={{ gap: space[2] }}>
            <Text variant="captionSm" color="textMuted">
              {k} · {typography[k].fontSize}/{typography[k].lineHeight}
            </Text>
            <Text variant={k}>가챠 탐색대 Vol.2 (400엔)</Text>
          </View>
        ))}
      </Section>

      <Section title="Button" note="variant × size">
        {VARIANTS.map((v) => (
          <View key={v} style={{ gap: space[8] }}>
            <Text variant="captionSm" color="textMuted">
              {v}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: space[8],
              }}
            >
              {SIZES.map((s) => (
                <Button key={s} variant={v} size={s}>
                  {`${s} 버튼`}
                </Button>
              ))}
            </View>
          </View>
        ))}
        <Text variant="captionSm" color="textMuted">
          fullWidth · disabled
        </Text>
        <Button fullWidth>추가하기</Button>
        <Button fullWidth disabled>
          추가하기
        </Button>
      </Section>

      <Section title="Chip" note="selected · selectedTone · trailing">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[8] }}>
          {(
            [
              ["all", "전체"],
              ["new", "신상품"],
            ] as const
          ).map(([v, label]) => (
            <Chip key={v} selected={filter === v} onPress={() => setFilter(v)}>
              {label}
            </Chip>
          ))}
          <Chip
            selected={filter === "media"}
            onPress={() => setFilter("media")}
            trailing={
              <ChevronDownIcon size={14} color={filter === "media" ? "onPrimary" : "text"} />
            }
          >
            작품
          </Chip>
          <Chip disabled>비활성</Chip>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space[8] }}>
          {(
            [
              ["all", "전체"],
              ["default", "기본 폴더"],
              ["forest", "별의 숲"],
            ] as const
          ).map(([v, label]) => (
            <Chip
              key={v}
              selectedTone="inverse"
              selected={folder === v}
              onPress={() => setFolder(v)}
            >
              {label}
            </Chip>
          ))}
        </View>
      </Section>

      <Section title="Segment" note="tone: primary · wish · get">
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.card,
            padding: space[16],
            gap: space[12],
          }}
        >
          <Segment
            value={status}
            onChange={setStatus}
            options={[
              { value: "wish", label: "WISH · 갖고 싶어요" },
              { value: "get", label: "GET · 소장 중" },
            ]}
          />
          <Segment
            value={tab}
            onChange={setTab}
            options={[
              { value: "wish", label: "WISH 18", tone: "wish" },
              { value: "get", label: "GET 32", tone: "get" },
            ]}
          />
        </View>
      </Section>

      <Section title="Input" note="label · helperText · leading · trailing · multiline">
        <Input
          label="아이템 이름"
          value={itemName}
          onChangeText={setItemName}
          helperText="같은 이름의 아이템이 있으면 알려드려요"
          clearLabel="지우기"
        />
        <Input placeholder="상품명 · 작품명으로 검색" />
        <Input label="메모" multiline placeholder="구매한 곳, 교환 희망 등 메모를 남겨 보세요" />
      </Section>

      <Section title="Card" note="default · highlight · onPress">
        <Card
          onPress={() => {}}
          accessibilityLabel="가챠 카드"
          style={{ padding: space[12], flexDirection: "row", gap: space[14] }}
        >
          <View
            style={{
              width: THUMB,
              height: THUMB,
              borderRadius: radius.thumb,
              backgroundColor: colors.accentSoft,
            }}
          />
          <View style={{ flex: 1, gap: space[4], justifyContent: "center" }}>
            <Text variant="bodyStrong">숲속 친구들 마스코트 Vol.2</Text>
            <Text variant="captionSm" color="textMuted">
              별의 숲 · 2026-10 · 400엔
            </Text>
          </View>
        </Card>
        <Card variant="highlight" style={{ padding: space[20], gap: space[4] }}>
          <Text variant="label" color="textMuted">
            내 굿즈 소장률
          </Text>
          <Text variant="displayLg" color="accent">
            64%
          </Text>
        </Card>
      </Section>

      <Section title="BottomSheet" note="open · onClose · title · closeLabel">
        <Button variant="outline" onPress={() => setSheetOpen(true)}>
          시트 열기
        </Button>
      </Section>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="아이템 추가"
        closeLabel="닫기"
      >
        <Segment
          value={status}
          onChange={setStatus}
          options={[
            { value: "wish", label: "WISH · 갖고 싶어요" },
            { value: "get", label: "GET · 소장 중", tone: "get" },
          ]}
        />
        <Input
          label="아이템 이름"
          value={itemName}
          onChangeText={setItemName}
          clearLabel="지우기"
        />
        <Input label="메모" multiline placeholder="구매한 곳, 교환 희망 등 메모를 남겨 보세요" />
        <Button fullWidth onPress={() => setSheetOpen(false)}>
          추가하기
        </Button>
      </BottomSheet>
    </ScrollView>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <View style={{ gap: space[12] }}>
      <View style={{ gap: space[2] }}>
        <Text variant="titleLg">{title}</Text>
        <Text variant="captionSm" color="textMuted">
          {note}
        </Text>
      </View>
      {children}
    </View>
  );
}
