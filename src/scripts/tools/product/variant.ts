import { productGetUrl, WithProduct } from "./product";
import { handlize } from '@process-creative/slate-theme-tools';

export type Variant = {
  available:boolean;
  barcode:string;
  compare_at_price:number|null;
  featured_image:string|null;
  featured_media:{ id:string };
  id:number;
  inventory_management:'shopify'|null;
  inventory_policy:'deny'|'continue';
  name:string;

  /** @deprecated */
  option1:string;
  /** @deprecated */
  option2:string|null;
  /** @deprecated */
  option3:string|null;

  options:string[];
  price:number;

  /** @deprecated */
  public_title:string;

  requires_shipping:boolean;
  sku:string|null;
  taxable:boolean;
  title:string;
  weight:number;
  inventory_quantity:number|null;
}

export type WithVariant = { variant:Variant; };
export type WithVariants = { variants:Variant[] };
export type WithVariantId = { variantId:number; };
export type WithOptions = { options:string[] };

export const variantFirstAvailable = ({ variants }:WithVariants) => {
  return variants.find(v => v.available);
}

export const variantFirstAvailableOrDefault = (p:WithVariants) => {
  return variantFirstAvailable(p) || p.variants[0];
}

export const variantGetFromOptions = (params:WithOptions & WithProduct): Variant | undefined => (
  params.product.variants.find(variant => (
    variantDoesHaveOption({ ...params, variant })
  ))
);

export const variantDoesHaveOption = (params:WithVariant & WithOptions) => (
  params.options.every((val,pos) => handlize(params.variant.options[pos]) === handlize(val))
);

export const variantGetUrl = (params:WithVariant & WithProduct) => (
  `${productGetUrl(params)}?variant=${params.variant.id}`
);

export const cleanseVariantTitle = (title:string) => {
  Object.entries({
    'XS': 'extra small',
    'S': 'small',
    'M': 'medium',
    'L': 'large',
    'XL': 'extra large',
    'XXL': 'extra extra large'
  }).some(([key, value]) => {
    if(title.toLowerCase() !== value) return false;
    title = key;
    return true;
  });
  return title;
}

export const fullVariantTitle = (title:string) => {
  Object.entries({
    'XXS': 'extra extra small',
    'XS': 'extra small',
    'S': 'small',
    'M': 'medium',
    'L': 'large',
    'XL': 'extra large',
    'XXL': 'extra extra large'
  }).some(([key, value]) => {
    if(title.toUpperCase() !== key) return false;
    title = value;
    return true;
  });
  return title;
}