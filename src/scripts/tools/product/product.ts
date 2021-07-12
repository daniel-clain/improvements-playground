import { Variant } from "./variant";
import { ProductImages } from "./product-images";

export type Option = {
  name: string;
  position: number;
  values: string[];
}

type ProductMetafieldProps = {
  primaryFeatureIcon?: {name: string, url: string}
  subheading?: string
}

export type Product = {
  available:boolean;
  image:string|null;
  compare_at_price:number|null;
  compare_at_price_max:number;
  compare_at_price_min:number;
  compare_at_price_varies:boolean;
  collections:string[];
  content:string;
  created_at:string;
  description:string;
  featured_image:string|null;
  handle:string;
  id:number;
  images:ProductImages[];
  options:Option[];
  price:number;
  price_max:number;
  price_min:number;
  price_varies:boolean;
  published_at:string;
  tags:string[];
  title:string;
  type:string;
  variants:Variant[];
  vendor:string;
  first_available_variant:Variant;
  url:string;
  options_with_values: {
    option1?: ProductOption
    option2?: ProductOption
    option3?: ProductOption
  }
} & ProductMetafieldProps

type ProductOption = {
  name: string
  position: 1|2|3
  selected: string
  values: string[]
}

export type WithProduct = { product:Product };

export const productGetUrl = ({product}:WithProduct) => `/products/${product.handle}`;

export const productGetUrlFromHandle = (p:{ handle:string }) => (
  `/products/${p.handle}`
);