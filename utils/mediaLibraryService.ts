import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import images from "@table/images";
import linkingSettingAlert from "./linkingSettingAlert";
import Constants from 'expo-constants';

/**
 * 미디어 라이브러리 권한 확인 및 요청
 */
const grantedPermission = async (): Promise<boolean> => {
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
    return false;
  }
};

/**
 * 이미지 선택 - 갤러리에서 이미지 하나 선택
 */
const selectImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const isGranted = await grantedPermission();

  if (!isGranted) {
    console.error("Cannot access to mediaLibrary");
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0];
  } catch (e) {
    console.error("selectImage Error : ", e);
    return null;
  }
};

/**
 * MediaLibrary Asset 영구 저장 (Android/iOS 공통)
 */
const saveImageToLibrary = async (asset: ImagePicker.ImagePickerAsset): Promise<string | null> => {
  try {
    // MediaLibrary 권한 재확인
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') {
      console.error('MediaLibrary permission not granted');
      return null;
    }

    // 갤러리 영구 asset 생성 (iOS: Photos, Android: MediaStore)
    const libraryAsset = await MediaLibrary.createAssetAsync(asset.uri);

    console.log('MediaLibrary asset created:', {
      id: libraryAsset.id,
      uri: libraryAsset.uri,
      filename: libraryAsset.filename
    });

    return libraryAsset.id; // Android/iOS 공통 영구 ID
  } catch (e) {
    console.error('saveImageToLibrary error:', e);
    return null;
  }
};

/**
 * 이미지 저장 - ImagePicker → MediaLibrary → DB (완전 영구 저장)
 */
const saveImage = async (img?: ImagePicker.ImagePickerAsset): Promise<string | null> => {
  const selectImg = img || await selectImage();

  console.log('saveImage called with asset:', selectImg);

  if (!selectImg) {
    console.error('No image asset provided');
    return null;
  }

  // Android인 경우에만 MediaLibrary 영구 저장 로직 실행
  const isAndroid = Constants?.platform?.ios === undefined;
  let libraryAssetId: string | null = null;

  if (isAndroid) {
    // 1. MediaLibrary로 영구 저장 (Android 전용)
    libraryAssetId = await saveImageToLibrary(selectImg);
    if (!libraryAssetId) {
      console.error('Failed to save to MediaLibrary');
      return null;
    }
  } else {
    // iOS는 uri 직접 사용
    libraryAssetId = selectImg.uri;
  }

  // 2. DB에 영구 ID 저장
  try {
    await images.create(libraryAssetId!);
    console.log('Image permanently saved with ID:', libraryAssetId);
    return libraryAssetId;
  } catch (e) {
    console.error("saveImage DB error: ", e);
    return null;
  }
};

export { selectImage, saveImage };
export type { ImagePickerAsset } from "expo-image-picker";
