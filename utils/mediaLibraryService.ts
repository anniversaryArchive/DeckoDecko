import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import images from "@table/images";
import linkingSettingAlert from "./linkingSettingAlert";
import {Platform} from "react-native";

/**
 * 미디어 라이브러리 권한 확인 및 요청
 */
const grantedPermission = async (): Promise<boolean> => {
  try {
    const initialStatus = await MediaLibrary.getPermissionsAsync();

    if (initialStatus.granted) {
      // iOS 'limited' 접근도 허용으로 처리하거나, 필요 시 별도 처리
      return true;
    }

    if (initialStatus.canAskAgain) {
      const { granted } = await MediaLibrary.requestPermissionsAsync();
      return granted;
    }

    // 권한 거부 처리
    linkingSettingAlert(
      "권한이 필요합니다",
      "사진 저장 및 선택을 위해 라이브러리 접근 권한을 허용해주세요."
    );
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
  // iOS 이미지를 고르기만 할 때는 MediaLibrary 권한이 필수가 아닐 수 있어서
  // 추후 저장을 위해 권한을 미리 체크하는 것이 안전하다고 함
  const isGranted = await grantedPermission();
  if (!isGranted) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
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
 * MediaLibrary Asset 영구 저장 (Android 전용 로직)
 */
const saveImageToLibrary = async (
  asset: ImagePicker.ImagePickerAsset
): Promise<{ id: string; mediaAsset: MediaLibrary.Asset } | null> => {
  try {
    if (!asset || !asset.uri) {
      console.error("asset.uri is null, cannot create MediaLibrary asset");
      return null;
    }

    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== "granted") {
      console.error("MediaLibrary permission not granted");
      return null;
    }

    const libraryAsset = await MediaLibrary.createAssetAsync(asset.uri);

    // createAssetAsync가 null을 반환하는 예외 상황 방어
    if (!libraryAsset) {
      console.error("Failed to create asset: libraryAsset is null");
      return null;
    }

    // 여기서 libraryAsset.uri 접근 시 null check 되었으므로 안전
    console.log("MediaLibrary asset created:", {
      id: libraryAsset.id,
      uri: libraryAsset.uri,
    });

    return { id: libraryAsset.id, mediaAsset: libraryAsset };
  } catch (e) {
    console.error("saveImageToLibrary error:", e);
    return null;
  }
};

/**
 * 안드로이드 이미지 선택 시 폴더 생성
 */
const ALBUM_NAME = "DeckoDecko";

const getOrCreateAlbum = async (asset: MediaLibrary.Asset) => {
  try {
    const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);

    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, true);
      return album;
    }
    return await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, true);
  } catch (e) {
    console.error("getOrCreateAlbum Error:", e);
    return null;
  }
};

/**
 * 이미지 저장 메인 함수
 */
const saveImage = async (img?: ImagePicker.ImagePickerAsset): Promise<string | null> => {
  const selectImg = img || (await selectImage());

  if (!selectImg) {
    console.log("No image selected");
    return null;
  }

  // Expo Constants 대신 React Native Platform API 사용함
  const isAndroid = Platform.OS === "android";
  let libraryAssetId: string | null = null;

  if (isAndroid) {
    // === ANDROID 로직 ===
    // 1. MediaLibrary에 asset 생성
    const saved = await saveImageToLibrary(selectImg);
    if (!saved) return null;

    libraryAssetId = saved.id;

    // 2. 앨범에 추가
    await getOrCreateAlbum(saved.mediaAsset);
  } else {
    // === iOS 로직 ===
    // iOS는 ImagePicker가 준 uri를 그대로 사용해도 앱 내에서 접근 가능
    libraryAssetId = selectImg.uri;
  }

  // 3. DB 저장
  try {
    if (libraryAssetId) {
      await images.create(libraryAssetId);
      console.log("Image saved to DB with ID:", libraryAssetId);
      return libraryAssetId;
    }
    return null;
  } catch (e) {
    console.error("saveImage DB error: ", e);
    return null;
  }
};

export { selectImage, saveImage };
export type { ImagePickerAsset } from "expo-image-picker";
