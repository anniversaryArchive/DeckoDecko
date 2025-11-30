import * as ImagePicker from "expo-image-picker";
import images from "@table/images";
import linkingSettingAlert from "./linkingSettingAlert";

/**
 * 사진 선택 권한 요청
 */
const requestImagePermission = async () => {
  try {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "granted") {
      return true;
    }

    if (status !== "granted" && canAskAgain) {
      const retry = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return retry.status === "granted";
    }

    if (!canAskAgain) {
      linkingSettingAlert(
        "권한이 필요합니다",
        "사진을 선택하려면 설정에서 사진 접근 권한을 허용해야 합니다."
      );
    }

    return false;
  } catch (e) {
    console.error("requestImagePermission Error:", e);
    return false;
  }
};


/**
 * 이미지 선택
 */
const selectImage = async () => {
  const granted = await requestImagePermission();
  if (!granted) {
    console.error("No image permission");
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return null;

    // ImagePicker는 always URI 제공
    return result.assets[0]; // { uri, width, height, fileName, ... }
  } catch (e) {
    console.error("selectImage Error:", e);
    return null;
  }
};


/**
 * 이미지 저장 (MediaLibrary 사용 X)
 * → 이미지의 URI만 DB에 저장
 */
const saveImage = async (img) => {
  const asset = img || (await selectImage());
  if (!asset) return null;

  try {
    // MediaLibrary를 쓰지 않으므로 assetId 없음 → uri 저장
    const uri = asset.uri;

    await images.create(uri);

    return uri;
  } catch (e) {
    console.error("saveImage Error:", e);
    return null;
  }
};


export { selectImage, saveImage };
