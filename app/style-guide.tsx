import { useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Typography,
  Button,
  InputBox,
  TextBox,
  SearchBox,
  WiggleBorder,
  ProgressBar,
  Chip,
  BasicSwiper,
  FeaturedSwiper,
  DropDown,
  BottomSheet,
  Segment,
} from "@/components";

const dropDownOptions = [
  { id: "1", name: "옵션 1" },
  { id: "2", name: "옵션 2" },
  { id: "3", name: "옵션 3" },
];

// 세그먼트 항목 데이터
const segmentItems = [
  { key: "WISH", label: "WISH" },
  { key: "GET", label: "GET" },
  { key: "ETC", label: "ETC" },
];

export default function StyleGuide() {
  const [progress, setProgress] = useState(25);
  const [dropDownOption, setDropDownOption] = useState<{ id: string; name: string } | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [bottomSheetKey, setBottomSheetKey] = useState("WISH");

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <ScrollView className="flex-1 p-4" contentContainerClassName="flex gap-6">
        <View className="flex gap-4">
          <Typography
            variant="header2"
            color="primary"
            className="bg-primary-light border-primary-light p-1 border"
          >
            Typography
          </Typography>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              variant
            </Typography>
            <View className=" flex gap-2">
              <Typography variant="header1">Header1 </Typography>
              <Typography variant="header2">Header2</Typography>
              <Typography variant="header3">Header3</Typography>
              <Typography variant="header4">Header4</Typography>
              <Typography variant="header5">Header5</Typography>
              <Typography variant="title1">Title1</Typography>
              <Typography variant="body1">Body1</Typography>
              <Typography variant="body2">Body2</Typography>
              <Typography variant="body3">Body3</Typography>
              <Typography variant="body4">Body4</Typography>
              <Typography variant="footnote">Footnote</Typography>
              <Typography variant="caption1">Caption1</Typography>
              <Typography variant="caption2">Caption2</Typography>
              <Typography variant="tag">Tag</Typography>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              color
            </Typography>
            <View className="flex gap-2 p-1 bg-black">
              <Typography variant="header4" color="primary">
                primary
              </Typography>
              <Typography variant="header4" color="primary-light">
                primary-light
              </Typography>
              <Typography variant="header4" color="secondary">
                secondary
              </Typography>
              <Typography variant="header4" color="secondary-light">
                secondary-light
              </Typography>
              <Typography variant="header4" color="secondary-dark">
                secondary-dark (default)
              </Typography>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              twotone
            </Typography>
            <View className="flex w-full gap-2">
              <Typography variant="header1" twotone="primary">
                H1) 하이큐!!
              </Typography>
              <Typography variant="header1" twotone="primary">
                H1) Haikyu!!
              </Typography>
              <Typography variant="header2" twotone="primary">
                H2) 하이큐!! Haikyu!!
              </Typography>
              <Typography variant="header3" twotone="primary">
                H3) 하이큐!! Haikyu!!
              </Typography>
            </View>
          </View>
        </View>
        <View className="flex gap-4">
          <Typography
            variant="header2"
            color="primary"
            className="bg-primary-light border-primary-light p-1 border"
          >
            Button
          </Typography>
          <View className="flex w-full gap-4">
            <View className="flex flex-row gap-5">
              <Typography variant="header3" color="secondary" className="w-[100px]">
                size
              </Typography>
              <View className="flex flex-row items-start gap-2">
                <Button onPress={() => {}}>sm</Button>
                <Button size="md" onPress={() => {}}>
                  md
                </Button>
                <Button size="lg" onPress={() => {}}>
                  lg
                </Button>
                <Button size="xl" onPress={() => {}}>
                  xl
                </Button>
              </View>
            </View>
            <View className="flex flex-row gap-5">
              <Typography variant="header3" color="secondary" className="w-[100px]">
                variant / disabled
              </Typography>
              <View className=" flex gap-2">
                <Button layout="flex" onPress={() => {}}>
                  primary
                </Button>
                <Button layout="flex" variant="outlined" onPress={() => {}}>
                  primary outlined
                </Button>
                <Button layout="flex" variant="text" onPress={() => {}}>
                  primary text
                </Button>
                <Button layout="flex" onPress={() => {}} disabled>
                  primary disabled
                </Button>
                <Button layout="flex" color="secondary" onPress={() => {}}>
                  secondary
                </Button>
                <Button layout="flex" variant="outlined" color="secondary" onPress={() => {}}>
                  secondary outlined
                </Button>
                <Button layout="flex" variant="text" color="secondary" onPress={() => {}}>
                  secondary text
                </Button>
                <Button layout="flex" color="secondary" onPress={() => {}} disabled>
                  secondary disabled
                </Button>
                <Button layout="flex" color="secondary-dark" onPress={() => {}}>
                  secondary-dark
                </Button>
                <Button layout="flex" variant="outlined" color="secondary-dark" onPress={() => {}}>
                  secondary-dark outlined
                </Button>
                <Button layout="flex" variant="text" color="secondary-dark" onPress={() => {}}>
                  secondary-dark text
                </Button>
                <Button layout="flex" color="secondary-dark" onPress={() => {}} disabled>
                  secondary-dark disabled
                </Button>
              </View>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              rounded
            </Typography>
            <View className=" flex flex-row gap-2">
              <Button layout="flex" onPress={() => {}}>
                default
              </Button>
              <Button layout="flex" rounded onPress={() => {}}>
                rounded
              </Button>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              width
            </Typography>
            <View className="grow flex flex-row gap-2">
              <Button layout="flex" onPress={() => {}}>
                fit(default)
              </Button>
              <Button layout="flex" width="full" onPress={() => {}}>
                full
              </Button>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              bold
            </Typography>
            <View className="grow flex flex-row gap-2">
              <Button layout="flex" bold onPress={() => {}}>
                bold
              </Button>
              <Button layout="flex" variant="outlined" bold onPress={() => {}}>
                outlined bold
              </Button>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px] break-words">
              textAlign (w-full)
            </Typography>
            <View className="grow flex gap-2">
              <Button layout="flex" width="full" textAlign="left" onPress={() => {}}>
                left
              </Button>
              <Button layout="flex" width="full" textAlign="center" onPress={() => {}}>
                center
              </Button>
              <Button layout="flex" width="full" textAlign="right" onPress={() => {}}>
                right
              </Button>
            </View>
          </View>
        </View>
        <View className="flex gap-4">
          <Typography
            variant="header2"
            color="primary"
            className="bg-primary-light border-primary-light p-1 border"
          >
            InputBox
          </Typography>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              size
            </Typography>
            <View className="grow flex gap-2">
              <InputBox size="sm" placeholder="sm (default)" />
              <InputBox size="md" placeholder="md" />
              <InputBox size="lg" placeholder="lg" />
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              variant
            </Typography>
            <View className="grow flex gap-2">
              <InputBox color="primary" placeholder="primary" />
              <InputBox color="secondary" placeholder="secondary" />
              <InputBox color="secondary-dark" placeholder="secondary-dark (default) " />
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              optional
            </Typography>
            <View className="grow flex gap-2">
              <InputBox placeholder="readOnly" readOnly />
              <InputBox placeholder="wiggleBorder" wiggleBorder />
            </View>
          </View>
        </View>
        <View className="flex gap-4">
          <Typography
            variant="header2"
            color="primary"
            className="bg-primary-light border-primary-light p-1 border"
          >
            TextBox
          </Typography>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              variant
            </Typography>
            <View className="grow flex gap-2">
              <TextBox color="primary" placeholder="primary" />
              <TextBox color="secondary" placeholder="secondary" />
              <TextBox color="secondary-dark" placeholder="secondary-dark (default)" />
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              optional
            </Typography>
            <View className="grow flex gap-2">
              <TextBox bold placeholder="bold=true" />
            </View>
          </View>
          <View className="flex gap-4">
            <Typography
              variant="header2"
              color="primary"
              className="bg-primary-light border-primary-light p-1 border"
            >
              SearchBox
            </Typography>
            <View className="flex gap-5">
              <Typography variant="header3" color="secondary" className="w-[100px]">
                color
              </Typography>
              <View className="grow flex gap-2">
                <SearchBox placeholder="primary (default)" onSubmit={() => {}} />
                <SearchBox color="secondary" placeholder="secondary" onSubmit={() => {}} />
                <SearchBox
                  color="secondary-dark"
                  placeholder="secondary-dark"
                  onSubmit={() => {}}
                />
              </View>
            </View>
          </View>
          <View className="flex gap-4">
            <Typography
              variant="header2"
              color="primary"
              className="bg-primary-light border-primary-light p-1 border"
            >
              WiggleBorder
            </Typography>
            <View className="flex flex-row gap-5">
              <Typography variant="header3" color="secondary" className="w-[100px]">
                Default
              </Typography>
              <View className="flex-1">
                <WiggleBorder>
                  <View className="p-2">
                    <Typography variant="body2" className="text-center">
                      Default Wiggle Border
                    </Typography>
                  </View>
                </WiggleBorder>
              </View>
            </View>
            <View className="flex flex-row gap-5">
              <Typography variant="header3" color="secondary" className="w-[100px]">
                Colors
              </Typography>
              <View className="flex-1">
                <WiggleBorder strokeColor="secondary">
                  <View className="p-2">
                    <Typography variant="body2" className="text-center">
                      Secondary Wiggle Border
                    </Typography>
                  </View>
                </WiggleBorder>

                <WiggleBorder strokeColor="secondary.dark">
                  <View className="p-2">
                    <Typography variant="body2" className="text-center">
                      Secondary Dark Wiggle Border
                    </Typography>
                    <Typography variant="body2" className="text-center">
                      Tailwind 에 명시한 컬러 모두 가능 ~
                    </Typography>
                  </View>
                </WiggleBorder>

                <WiggleBorder strokeColor="#ccaaaa">
                  <View className="p-2">
                    <Typography variant="body2" className="text-center">
                      Hex 컬러도 당연히 가능함둥
                    </Typography>
                  </View>
                </WiggleBorder>
              </View>
            </View>
            <View className="flex flex-row gap-5">
              <Typography variant="header3" color="secondary" className="w-[100px]">
                Wiggle
              </Typography>
              <View className="flex-1">
                <WiggleBorder wiggle={100}>
                  <View className="p-2">
                    <Typography variant="body2" className="text-center">
                      Wiggle 100
                    </Typography>
                    <Typography variant="body2" className="text-center">
                      Tailwind 에 명시한 컬러 모두 가능 ~
                    </Typography>
                  </View>
                </WiggleBorder>
                <WiggleBorder smoothen={100}>
                  <View className="p-2">
                    <Typography variant="body2" className="text-center">
                      smoothen 100
                    </Typography>
                  </View>
                </WiggleBorder>
                <View className="w-52 h-52">
                  <WiggleBorder frequency={100} backgroundColor="primary">
                    <Image
                      className="w-48 h-48"
                      source={{
                        uri: "https://bandai-a.akamaihd.net/bc/img/model/b/1000234207_1.jpg",
                      }}
                    />
                  </WiggleBorder>
                </View>
              </View>
            </View>
          </View>
          <View className="flex gap-4">
            <Typography
              variant="header2"
              color="primary"
              className="bg-primary-light border-primary-light p-1 border"
            >
              ProgressBar
            </Typography>
            <View className="flex flex-row justify-around">
              <Button onPress={() => setProgress(progress < 10 ? 0 : progress - 10)}>-10</Button>
              <Typography variant="body2" className="my-auto">
                {progress}
              </Typography>
              <Button onPress={() => setProgress(progress > 90 ? 100 : progress + 10)}>+10</Button>
            </View>
            <View className="flex flex-row gap-5">
              <Typography variant="header3" color="secondary" className="w-[100px]">
                Default
              </Typography>
              <View className="flex flex-col justify-center flex-1 gap-2">
                <ProgressBar value={progress} />
                <ProgressBar
                  value={progress}
                  activeColor="secondary.dark"
                  backgroundColor="secondary.light"
                  height={15}
                />
              </View>
            </View>
          </View>
        </View>
        <View className="flex gap-4">
          <Typography
            variant="header2"
            color="primary"
            className="bg-primary-light border-primary-light p-1 border"
          >
            Swiper
          </Typography>
          <View className="flex gap-2">
            <Typography variant="header3" color="secondary">
              Basic Swiper
            </Typography>
            <View className="-mx-4">
              <BasicSwiper
                data={[1, 2, 3]}
                onSlidePress={(index, item) => {
                  // console.log(`Clicked slide at index ${index} with item:`, item);
                }}
              />
            </View>
          </View>
          <View className="flex gap-2">
            <Typography variant="header3" color="secondary">
              Featured Swiper
            </Typography>
            <FeaturedSwiper
              title="새로 나왔어요!"
              data={[{ id: 1, imageUrl: "" }, { id: 2, imageUrl: "" }, { id: 3 }]}
              onSlidePress={(item, index) => {
                // console.log('슬라이드 클릭됨:', index, item);
              }}
            />
          </View>
        </View>
        <View className="flex gap-4">
          <Typography
            variant="header2"
            color="primary"
            className="bg-primary-light border-primary-light p-1 border"
          >
            드롭박스
          </Typography>
          <View className="flex gap-2">
            <DropDown<{ id: string; name: string }>
              data={dropDownOptions}
              selectedValue={dropDownOption}
              onValueChange={setDropDownOption}
              labelExtractor={(item) => item.name}
              placeholder="옵션을 선택하세요"
            />
            <DropDown<{ id: string; name: string }>
              data={dropDownOptions}
              selectedValue={null}
              onValueChange={() => {}}
              labelExtractor={(item) => item.name}
              placeholder="disabled"
              disabled={true}
            />
          </View>
        </View>
        <View className="flex gap-4">
          <Typography
            variant="header2"
            color="primary"
            className="bg-primary-light border-primary-light p-1 border"
          >
            Chip
          </Typography>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              color
            </Typography>
            <View className="flex flex-row items-start gap-2">
              <Chip label="primary" color="primary" />
              <Chip label="secondary-light(default)" />
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              size
            </Typography>
            <View className=" flex flex-row gap-2">
              <Chip label="sm" size="sm" />
              <Chip label="md(default)" size="md" />
              <Chip label="lg" size="lg" />
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <Typography variant="header3" color="secondary" className="w-[100px]">
              optional
            </Typography>
            <View className="flex items-start gap-2">
              <Chip
                value="click"
                label="onClick(log 확인)"
                onClick={(value) => {
                  console.log("onClick", value);
                }}
              />
              <Chip
                size="lg"
                value="delete"
                label="onDelete(log 확인)"
                onDelete={(value) => {
                  console.log("onDelete", value);
                }}
              />
              <Typography variant="footnote">* onClick&onDelete 동시 사용 가능</Typography>
            </View>
          </View>
        </View>
        <View className="flex gap-4">
          <Typography
            variant="header2"
            color="primary"
            className="bg-primary-light border-primary-light p-1 border"
          >
            BottomSheet & Segment
          </Typography>
          <Button
            size="lg"
            onPress={() => {
              setBottomSheetOpen(true);
            }}
          >
            예제 확인하기
          </Button>
        </View>
      </ScrollView>
      <BottomSheet open={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)}>
        <Segment
          segments={segmentItems}
          selectedKey={bottomSheetKey}
          onSelect={setBottomSheetKey}
        />
        <View className="mt-4">
          {bottomSheetKey === "WISH" && <Typography>WISH 내용</Typography>}
          {bottomSheetKey === "GET" && <Typography>GET 내용</Typography>}
          {bottomSheetKey === "ETC" && <Typography>ETC 내용</Typography>}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
