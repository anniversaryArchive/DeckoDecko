import { TAnime } from "./anime";

export type TGacha = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  name_kr: string;
  image_link: string;
  anime_id?: number;
  price: number;
  anime?: TAnime;
};
