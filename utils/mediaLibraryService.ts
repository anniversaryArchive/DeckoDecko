import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

import images from "@table/images";
import linkingSettingAlert from "./linkingSettingAlert";

const grantedPermission = async () => {
  try {
    const initialStatus = await MediaLibrary.getPermissionsAsync();

    // 모든 권한이 허용된 경우
    if (initialStatus.granted && initialStatus.accessPrivileges === "all") {
      return true;
    }

    // 권한이 허용되지 않았고, 다시 물어볼 수 있는 경우
    if (!initialStatus.granted && initialStatus.canAskAgain) {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      return granted;
    }

    // '제한된 접근' 권한인 경우
    if (initialStatus.accessPrivileges === "limited") {
      linkingSettingAlert(
        "'모든 사진' 접근 허용이 필요합니다",
        "사진을 모두 보려면 설정에서 '모든 사진'으로 권한을 변경해주세요."
      );

      return false;
    }

    // 권한이 거부되었고, 다시 물어볼 수 없는 경우
    if (!initialStatus.granted && !initialStatus.canAskAgain) {
      linkingSettingAlert(
        "권한이 거부되었습니다",
        "사진첩에 접근하려면 앱 설정에서 직접 권한을 허용해야 합니다."
      );

      return false;
    }

    return false;
  } catch (e) {
    console.error("grantedPermission Error : ", e);
  }
};

const selectImage = async () => {
  const isGranted = await grantedPermission();

  if (!isGranted) {
    console.error("Canntot access to mediaLibray");
    return null;
  }

  try {
    const selectImg = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
    });

    if (!selectImg.canceled) return selectImg.assets[0];

    return null;
  } catch (e) {
    console.error("selectImage Error : ", e);
  }
};

const saveImage = async (img?: ImagePicker.ImagePickerAsset) => {
  const selectImg = img || (await selectImage());

  if (!selectImg || !selectImg.assetId) {
    return null;
  }

  try {
    // 로컬 디비 저장
    const assetId = selectImg.assetId;
    await images.create(assetId);
    return assetId;
  } catch (e) {
    console.error("err", e);
    return null;
  }
};

export { selectImage, saveImage };
