import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";

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
  GoodsCard,
  Input,
  ProgressBar,
  Segment,
  TabBar,
  Text,
  useToast,
  type ButtonSize,
  type ButtonVariant,
  type TabBarVariant,
} from "@deckodecko/ui/native";

/** 색 견본 한 칸의 크기 */
const SWATCH = 36;
/** 카드 견본 안 썸네일 크기 */
const THUMB = 64;
/** 칩 오른쪽 ⌄ 아이콘 크기 */
const CHEVRON_SIZE = 14;
/** 색 쓰임 예시 안 썸네일 크기 */
const USAGE_THUMB = 24;
/** 색 쓰임 예시의 진행 막대 높이 · 점 지름 */
const USAGE_BAR = 6;
const USAGE_DOT = 8;
/** 색 쓰임 예시의 진행률 (목 데이터) */
const USAGE_PROGRESS = "64%";
/** GoodsCard 자리 표시 아이콘 크기 */
const GOODS_ICON = 32;
/** GoodsCard 가로 카드의 위시 버튼 지름 · 아이콘 크기 (시안의 목록 화면) */
const WISH_BUTTON = 36;
const WISH_ICON = 18;

/** TabBar 견본의 탭 (앱의 하단 탭과 같은 아이콘) */
const TABS = [
  { key: "home", label: "홈", icon: "home", iconOff: "home-outline" },
  { key: "goods", label: "내 굿즈", icon: "folder", iconOff: "folder-outline" },
  { key: "search", label: "검색", icon: "search", iconOff: "search" },
] as const;

/** TabBar 견본: 모양마다 한 줄씩 */
const TAB_VARIANTS: { variant: TabBarVariant; note: string }[] = [
  { variant: "pill", note: "선택된 탭만 이름 (시안)" },
  { variant: "labeled", note: "늘 아이콘 아래 이름" },
  { variant: "icon", note: "아이콘만" },
];

/** Toast 견본 문구 (시안 "아이템 추가 실패") */
const SAVE_FAILED = {
  title: "저장하지 못했어요",
  message: "같은 이름의 아이템이 이미 있어요. 이름을 바꿔 주세요.",
};

/** ProgressBar 견본의 종 수 범위. 20 을 넘기면 칸 사이가 좁아지는 것도 본다 */
const MAX_TOTAL = 30;

type ColorRole = keyof ThemeColors;

/** 색 역할을 용도별로 묶는다. 여기 없는 역할(새로 추가된 것)은 "기타"에 나온다 */
const COLOR_GROUPS: { title: string; roles: ColorRole[]; usage?: "surface" | "accent" }[] = [
  { title: "면 · 선", roles: ["bg", "surface", "line", "lineSoft", "scrim"], usage: "surface" },
  { title: "글자", roles: ["text", "textMuted", "textPlaceholder", "textFaint"] },
  {
    title: "강조",
    roles: ["accentSoft", "highlightSurface", "highlightLine", "getMark"],
    usage: "accent",
  },
];
/** 면과 그 위 글자 쌍. 면 위에 글자를 얹어 읽기 괜찮은지 같이 본다 */
const COLOR_PAIRS: [ColorRole, ColorRole][] = [
  ["accent", "onAccent"],
  ["primary", "onPrimary"],
  ["wishSurface", "onWish"],
  ["getSurface", "onGet"],
  ["inverse", "onInverse"],
  ["inverse", "onInverseMuted"],
];

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
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [folder, setFolder] = useState("all");
  const [status, setStatus] = useState<"wish" | "get">("wish");
  const [tab, setTab] = useState<"wish" | "get">("get");
  const [itemName, setItemName] = useState("토끼 (당근 바구니)");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tabKey, setTabKey] = useState<(typeof TABS)[number]["key"]>("home");

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: gutter, gap: space[32] }}
    >
      <Text color="textMuted">테마: {name}</Text>

      <Section title="색 역할" note="useTheme().colors · 용도별로 묶었다">
        <ColorRoles />
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
              <ChevronDownIcon
                size={CHEVRON_SIZE}
                color={filter === "media" ? "onPrimary" : "text"}
              />
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
        <Input placeholder="상품명 · 작품명으로 검색" clearLabel="지우기" />
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

      <Section
        title="GoodsCard"
        note="layout: vertical(size md · sm) · horizontal, badge · accessory"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // 카드가 화면 끝까지 이어져 보이도록 좌우 여백만큼 넓힌다
          style={{ marginHorizontal: -gutter }}
          contentContainerStyle={{ paddingHorizontal: gutter, gap: space[12] }}
        >
          <GoodsCard
            caption="별의 숲"
            title="숲속 친구들 마스코트 Vol.2"
            price="400엔"
            image={<GoodsPlaceholder />}
            onPress={() => {}}
          />
          <GoodsCard
            caption="마법소녀 루나"
            title="루나 아크릴 키링"
            price="300엔"
            badge={{ label: "NEW", tone: "accent" }}
            image={<GoodsPlaceholder />}
            onPress={() => {}}
          />
          <GoodsCard
            size="sm"
            caption="고양이 일기"
            title="고양이 카페 메지루시 액세서리"
            onPress={() => {}}
          />
          <GoodsCard size="sm" title="작품명이 없는 가챠" onPress={() => {}} />
        </ScrollView>
        <GoodsCard
          layout="horizontal"
          caption="별의 숲"
          title="숲속 친구들 마스코트 Vol.2"
          price="1회 400엔"
          priceNote="(세금 포함)"
          meta="2026년 10월 발매 · 전 6종"
          badge={{ label: "NEW", tone: "accent" }}
          image={<GoodsPlaceholder />}
          accessory={<RowAccessory owned="3/6" />}
          onPress={() => {}}
        />
        <GoodsCard
          layout="horizontal"
          caption="마법소녀 루나"
          title="마법소녀 루나 아크릴 참 컬렉션 — 긴 이름은 두 줄까지 보이고 나머지는 줄인다"
          price="1회 300엔"
          priceNote="(세금 포함)"
          meta="2026년 11월 발매 예정 · 전 8종"
          badge={{ label: "발매 예정", tone: "get" }}
          accessory={<RowAccessory />}
          onPress={() => {}}
        />
      </Section>

      <Section
        title="ProgressBar"
        note="summary(value) · segments(get · wish · total · legend). 아래 버튼으로 값을 바꿔 본다"
      >
        <ProgressBarDemo />
      </Section>

      <Section title="TabBar" note="variant: pill(기본) · labeled · icon. 눌러서 탭을 바꿔 본다">
        {TAB_VARIANTS.map(({ variant, note }) => (
          <View key={variant} style={{ gap: space[6] }}>
            <Text variant="captionSm" color="textMuted">
              {variant} — {note}
            </Text>
            <TabBar
              variant={variant}
              items={TABS.map((tab) => ({
                key: tab.key,
                label: tab.label,
                selected: tab.key === tabKey,
                onPress: () => setTabKey(tab.key),
                renderIcon: ({ color, size, selected }) => (
                  <Ionicons name={selected ? tab.icon : tab.iconOff} color={color} size={size} />
                ),
              }))}
            />
          </View>
        ))}
      </Section>

      <Section
        title="Toast"
        note="useToast().show({ title · message · actionLabel · onAction · duration })"
      >
        <View style={{ flexDirection: "row", gap: space[8] }}>
          <Button variant="outline" size="sm" onPress={() => toast.show(SAVE_FAILED)}>
            제목 · 설명
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() =>
              toast.show({
                ...SAVE_FAILED,
                actionLabel: "다시 열기",
                onAction: () => setSheetOpen(true),
                duration: null,
              })
            }
          >
            동작 버튼 · 안 사라짐
          </Button>
        </View>
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

/** ProgressBar 견본: GET · WISH · 종 수를 바꾸면 두 막대가 같이 바뀐다 */
function ProgressBarDemo() {
  const [get, setGet] = useState(3);
  const [wish, setWish] = useState(2);
  const [total, setTotal] = useState(6);
  const none = Math.max(0, total - get - wish);
  const rate = total > 0 ? get / total : 0;
  return (
    <>
      <Card variant="highlight" style={{ padding: space[20], gap: space[12] }}>
        <View
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <Text variant="label" color="textMuted">
            소장률 (GET / 종 수)
          </Text>
          <Text variant="headingLg" color="accent">
            {Math.round(rate * 100)}%
          </Text>
        </View>
        <ProgressBar variant="summary" value={rate} accessibilityLabel="소장률" />
      </Card>
      <Card style={{ paddingVertical: space[16], paddingHorizontal: space[18] }}>
        <ProgressBar
          variant="segments"
          get={get}
          wish={wish}
          total={total}
          legend={{ get: `GET ${get}`, wish: `WISH ${wish}`, none: `미등록 ${none}` }}
          accessibilityLabel="이 가챠 소장률"
        />
      </Card>
      <Card style={{ paddingVertical: space[8], paddingHorizontal: space[18] }}>
        {/* GET + WISH 는 종 수를 넘지 않게, 종 수는 GET + WISH 아래로 줄지 않게 */}
        <Stepper label="GET" value={get} onChange={setGet} max={total - wish} />
        <Stepper label="WISH" value={wish} onChange={setWish} max={total - get} />
        <Stepper label="종 수" value={total} onChange={setTotal} min={get + wish} max={MAX_TOTAL} />
      </Card>
    </>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space[8],
        paddingVertical: space[4],
      }}
    >
      <Text variant="label" style={{ flex: 1 }}>
        {label}
      </Text>
      <Button
        variant="secondary"
        size="sm"
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        accessibilityLabel={`${label} 줄이기`}
      >
        −
      </Button>
      <Text variant="bodyStrong" style={{ minWidth: space[32], textAlign: "center" }}>
        {value}
      </Text>
      <Button
        variant="secondary"
        size="sm"
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        accessibilityLabel={`${label} 늘리기`}
      >
        +
      </Button>
    </View>
  );
}

/** GoodsCard 견본의 사진 자리 (앱의 썸네일 컴포넌트 대신) */
function GoodsPlaceholder() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name="gift-outline" size={GOODS_ICON} color={colors.accent} />
    </View>
  );
}

/** 가로 카드 오른쪽 칸 견본: 위시 버튼 + 소장 개수 */
function RowAccessory({ owned }: { owned?: string }) {
  const { colors } = useTheme();
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="위시 담기"
        onPress={() => {}}
        style={{
          width: WISH_BUTTON,
          height: WISH_BUTTON,
          borderRadius: radius.full,
          backgroundColor: colors.wishSurface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart-outline" size={WISH_ICON} color={colors.onWish} />
      </Pressable>
      {owned ? (
        <View
          style={{
            paddingHorizontal: space[8],
            paddingVertical: space[2],
            borderRadius: radius.full,
            backgroundColor: colors.getSurface,
          }}
        >
          <Text variant="captionSm" weight="bold" color="onGet">
            {owned}
          </Text>
        </View>
      ) : null}
    </>
  );
}

function ColorRoles() {
  const { colors } = useTheme();
  const listed = new Set<ColorRole>([
    ...COLOR_GROUPS.flatMap((g) => g.roles),
    ...COLOR_PAIRS.flat(),
  ]);
  const rest = (Object.keys(colors) as ColorRole[]).filter((k) => !listed.has(k));
  const groups = rest.length ? [...COLOR_GROUPS, { title: "기타", roles: rest }] : COLOR_GROUPS;
  return (
    <View style={{ gap: space[20] }}>
      {groups.slice(0, 2).map((g) => (
        <ColorGroup key={g.title} title={g.title}>
          {g.roles.map((k) => (
            <ColorRow key={k} role={k} sample={g.title === "글자"} />
          ))}
          {g.usage === "surface" ? <SurfaceUsage /> : null}
        </ColorGroup>
      ))}
      <ColorGroup title="면 · 그 위 글자">
        {COLOR_PAIRS.map(([surface, on]) => (
          <ColorPair key={`${surface}-${on}`} surface={surface} on={on} />
        ))}
      </ColorGroup>
      {groups.slice(2).map((g) => (
        <ColorGroup key={g.title} title={g.title}>
          {g.roles.map((k) => (
            <ColorRow key={k} role={k} />
          ))}
          {g.usage === "accent" ? <AccentUsage /> : null}
        </ColorGroup>
      ))}
    </View>
  );
}

/** 예시 아래에 어떤 역할을 어디에 썼는지 적는다 */
function UsageNote({ children }: { children: ReactNode }) {
  return (
    <Text variant="captionSm" color="textMuted">
      {children}
    </Text>
  );
}

/** 면 · 선이 화면에서 쓰이는 모습: 바탕 위 카드와 목록, 시트 뒤를 덮는 scrim */
function SurfaceUsage() {
  const { colors } = useTheme();
  const frame = {
    flex: 1,
    borderRadius: radius.tile,
    borderWidth: border.divider,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    overflow: "hidden",
  } as const;
  return (
    <View style={{ gap: space[8], marginTop: space[4] }}>
      <Text variant="caption" weight="bold">
        이렇게 쓴다
      </Text>
      <View style={{ flexDirection: "row", gap: space[12] }}>
        <View style={{ flex: 1, gap: space[6] }}>
          <View style={[frame, { padding: space[12] }]}>
            <View
              style={{
                paddingHorizontal: space[12],
                borderRadius: radius.row,
                borderWidth: border.default,
                borderColor: colors.line,
                backgroundColor: colors.surface,
              }}
            >
              {["토끼", "곰돌이"].map((item, i) => (
                <View
                  key={item}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: space[8],
                    paddingVertical: space[10],
                    borderTopWidth: i === 0 ? 0 : border.divider,
                    borderTopColor: colors.lineSoft,
                  }}
                >
                  <View
                    style={{
                      width: USAGE_THUMB,
                      height: USAGE_THUMB,
                      borderRadius: radius.bar,
                      borderWidth: border.divider,
                      borderColor: colors.lineSoft,
                      backgroundColor: colors.bg,
                    }}
                  />
                  <Text variant="captionSm">{item}</Text>
                </View>
              ))}
            </View>
          </View>
          <UsageNote>
            바탕 bg · 카드 surface + line 테두리 · 행 구분선과 썸네일 테두리 lineSoft
          </UsageNote>
        </View>
        <View style={{ flex: 1, gap: space[6] }}>
          <View style={[frame, { justifyContent: "flex-end" }]}>
            <View style={{ padding: space[12], gap: space[6] }}>
              <Text variant="captionSm">뒤 화면</Text>
              <Text variant="captionSm" color="textMuted">
                목록 · 카드
              </Text>
            </View>
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor: colors.scrim,
              }}
            />
            <View
              style={{
                padding: space[12],
                borderTopLeftRadius: radius.tile,
                borderTopRightRadius: radius.tile,
                backgroundColor: colors.surface,
              }}
            >
              <Text variant="captionSm" weight="bold">
                시트
              </Text>
            </View>
          </View>
          <UsageNote>시트 · 다이얼로그 뒤를 덮는 scrim, 시트 면은 surface</UsageNote>
        </View>
      </View>
    </View>
  );
}

/** 강조 색이 쓰이는 모습: 연한 포인트 면, 강조 카드, GET 진행 막대 */
function AccentUsage() {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space[12], marginTop: space[4] }}>
      <Text variant="caption" weight="bold">
        이렇게 쓴다
      </Text>
      <View style={{ gap: space[6] }}>
        <View style={{ flexDirection: "row", gap: space[8] }}>
          {["신상품", "별의 숲"].map((label) => (
            <View
              key={label}
              style={{
                paddingHorizontal: space[12],
                paddingVertical: space[6],
                borderRadius: radius.full,
                backgroundColor: colors.accentSoft,
              }}
            >
              <Text variant="captionSm" weight="bold" color="accent">
                {label}
              </Text>
            </View>
          ))}
        </View>
        <UsageNote>accentSoft: 연한 포인트 면 (칩 배경, 상세 상단)</UsageNote>
      </View>
      <View style={{ gap: space[6] }}>
        <View
          style={{
            gap: space[4],
            padding: space[16],
            borderRadius: radius.banner,
            borderWidth: border.default,
            borderColor: colors.highlightLine,
            backgroundColor: colors.highlightSurface,
          }}
        >
          <Text variant="caption" color="textMuted">
            내 굿즈 소장률
          </Text>
          <Text variant="headingLg" color="accent">
            {USAGE_PROGRESS}
          </Text>
        </View>
        <UsageNote>
          highlightSurface 면 + highlightLine 테두리: 강조 카드 (홈 소장률 카드, 로고 타일)
        </UsageNote>
      </View>
      <View style={{ gap: space[6] }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space[8] }}>
          <View
            style={{
              width: USAGE_DOT,
              height: USAGE_DOT,
              borderRadius: radius.full,
              backgroundColor: colors.getMark,
            }}
          />
          <View
            style={{
              flex: 1,
              height: USAGE_BAR,
              borderRadius: radius.bar,
              backgroundColor: colors.lineSoft,
              overflow: "hidden",
            }}
          >
            <View
              style={{ width: USAGE_PROGRESS, height: "100%", backgroundColor: colors.getMark }}
            />
          </View>
        </View>
        <UsageNote>getMark: GET 진행 막대 · 점 (막대 바탕은 lineSoft)</UsageNote>
      </View>
    </View>
  );
}

/** hex 는 대문자로 맞추고, rgba 등 다른 형식은 그대로 보여 준다 */
function formatColor(value: string) {
  return value.startsWith("#") ? value.toUpperCase() : value;
}

function ColorGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: space[8] }}>
      <Text variant="label" color="textMuted">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** 견본 · 이름 · 값 한 줄. 글자 역할은 그 색으로 쓴 예문을 오른쪽에 둔다 */
function ColorRow({ role, sample = false }: { role: ColorRole; sample?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space[12] }}>
      <View
        style={{
          width: SWATCH,
          height: SWATCH,
          borderRadius: radius.thumb,
          borderWidth: border.divider,
          borderColor: colors.line,
          backgroundColor: colors[role],
        }}
      />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{role}</Text>
        <Text variant="captionSm" color="textMuted">
          {formatColor(colors[role])}
        </Text>
      </View>
      {sample ? <Text color={role}>가챠 탐색대 Vol.2</Text> : null}
    </View>
  );
}

/** 면 위에 글자를 얹은 견본 */
function ColorPair({ surface, on }: { surface: ColorRole; on: ColorRole }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: space[12],
        paddingVertical: space[12],
        paddingHorizontal: space[16],
        borderRadius: radius.field,
        borderWidth: border.divider,
        borderColor: colors.line,
        backgroundColor: colors[surface],
      }}
    >
      <Text variant="bodyStrong" color={on}>
        가챠 탐색대 Vol.2
      </Text>
      <View style={{ alignItems: "flex-end" }}>
        <Text variant="captionSm" color={on}>
          {surface} {formatColor(colors[surface])}
        </Text>
        <Text variant="captionSm" color={on}>
          {on} {formatColor(colors[on])}
        </Text>
      </View>
    </View>
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
