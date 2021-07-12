import { AccentuateImage } from "@process-creative/slate-theme-tools";
import { Product } from "./product";

export type Collection = {
  id:number;
  handle:string;
  title:string;
  all_tags:string[];
  all_types:string[];
  all_products_count:number;
  page:number;
  default_sort_by:string;
  products:Product[];
  all_product_handles:string[];
  thumbnail_level_2:AccentuateImage;
}

export const collectionGetUrlFromHandle = (handle:string) => {
  return `/collections/${handle}`;
}