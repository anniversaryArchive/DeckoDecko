import { TMedia } from "./media";

export type TGacha = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  name_kr: string;
  image_link: string;
  media_id?: number;
  price: number;
  media?: TMedia;
};
