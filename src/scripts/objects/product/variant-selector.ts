/*
 *  Variant Selector
 *    Scripts for the variant selector
 *
 *  Version:
 *    1.0.0 - 2020/11/22
 */

import { Product, WithProduct } from './../../tools/product/product';
import { Variant, WithVariant, WithVariantId } from './../../tools/product/variant';

// Selectors
const SELECTOR_VARIANT_SELECTOR = '[data-variant-selector]';

// Attributes
const ATTR_PRODUCT_DATA = 'data-product';

// Events
const EVENT_VARIANT = 'variant';

// Types
type VariantSelectorInput = (HTMLInputElement | HTMLSelectElement);

export type VariantSelector = {
  product:Product;
  variant:Variant;
  selector:VariantSelectorInput;
}

export type WithVariantSelectorInput = { selector:VariantSelectorInput };
export type WithVariantSelector = { variantSelector:VariantSelector };
export type WithVariantWatch = {
  variantChange:(params:WithVariantSelector & WithVariant & WithProduct) => void
};

type VariantEvent = CustomEvent<
  WithVariantSelector & WithVariant & WithVariantId & WithProduct
>;

export const variantSelectorFind = ({ container }:{ container:HTMLElement }) => {
  const input = container.querySelectorAll<VariantSelectorInput>(SELECTOR_VARIANT_SELECTOR);
  if(!input) return null;
  return variantSelectorCreate({ selector: input[0] });
}

type CreateParams = WithVariantSelectorInput;
const variantSelectorCreate = (params:CreateParams) => {
  // Load the product data
  const productString = params.selector.getAttribute(ATTR_PRODUCT_DATA);
  if(!productString) return null;
  const product = JSON.parse(productString) as Product;

  // Get the currently selected variant and setup the VS
  const value = params.selector.value;
  const variant = product.variants.find(v => `${v.id}` == value);
  if(!variant) return null;
  const variantSelector:VariantSelector = { ...params, product, variant };

  // Setup event listener
  const onVariantChange = (e:Event) => {
    const variantId = parseInt(params.selector.value);
    const variant = variantSelectorSetVariant({ variantSelector, variantId, product });
    if(variant) return; // Valid variant
    e.preventDefault(); // Invalid variant
  }
  params.selector.addEventListener('change', onVariantChange);

  return variantSelector;
}

type SetVariantParams = WithVariantSelector & WithVariantId & WithProduct;
export const variantSelectorSetVariant = (params:SetVariantParams) => {
  const { variantSelector, variantId, product } = params;

  // Find the variant
  const variant = variantSelector.product.variants.find(v => (
    v.id === variantId
  ));
  if(!variant) return null;

  // Update the VS (if necessary)
  variantSelector.variant = variant;
  if(variantSelector.selector.value != `${variant.id}`) {
    variantSelector.selector.value = `${variant.id}`;
  }

  // Trigger custom event for watchers
  variantSelector.selector.dispatchEvent(new CustomEvent(EVENT_VARIANT, {
    detail: { variantSelector, variant, variantId, product }
  }));
  return variant;
};

export const onVariantSelected = (func: (variantId?: string) => void) => {
  const variantSelectorElem: HTMLSelectElement = document.querySelector(SELECTOR_VARIANT_SELECTOR)!
  variantSelectorElem.addEventListener('change', _ => {
    const variantId = variantSelectorElem.value
    func(variantId)
  })
}

type WatchParams = WithVariantSelector & WithVariantWatch;
export const variantSelectorWatch = (params:WatchParams) => {
  // Create event callback
  const event = (e:Event) => {
    const evt = e as VariantEvent;
    return params.variantChange({ ...evt.detail })
  };

  // Add listener
  params.variantSelector.selector.addEventListener(EVENT_VARIANT, event);

  // Return event remover
  return () => {
    params.variantSelector.selector.removeEventListener(EVENT_VARIANT, event);
  };
}

export function getVariant(): Variant{
  const productObj: Product = JSON.parse(document.querySelector(SELECTOR_VARIANT_SELECTOR)!.getAttribute('data-product')!)
  const variantId = document.querySelector<HTMLSelectElement>(SELECTOR_VARIANT_SELECTOR)!.value
  return productObj.variants.find(v => v.id == Number(variantId))!
}