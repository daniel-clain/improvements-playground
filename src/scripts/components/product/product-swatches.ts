/*
 *  Product Swatches
 *    Scripts for the product swatches
 *
 *  Version:
 *    1.0.0 - 2020/11/22
 */

import { CLASS_SELECTED, CLASS_SOLD_OUT } from './../../tools/constants/classes';
import { Product, WithProduct } from '../../tools/product/product';
import { handlize } from '@process-creative/slate-theme-tools';
import {
  Variant, variantFirstAvailableOrDefault, variantGetFromOptions, WithVariant
} from '../../tools/product/variant';
import {
  VariantSelector, variantSelectorFind, variantSelectorSetVariant,
  variantSelectorWatch, WithVariantSelector
} from "../../objects/product/variant-selector";

// Types
type WithSwatchContainer = { swatchContainer:HTMLElement; };
type WithSwatches = { swatches:ProductSwatches };

type ProductSwatches = {
  swatchContainer:HTMLElement;
  variantSelector:VariantSelector;
  variantWatcher:ReturnType<typeof variantSelectorWatch>;
  options:string[];
  groups:HTMLDivElement[];
  objects:HTMLButtonElement[];
  selects:HTMLSelectElement[];
};

// Selectors
const SELECTOR_SWATCH_GROUP = '[data-swatch-group]';
const SELECTOR_SWATCH_OBJ = '[data-swatch-object]';
const SELECTOR_SWATCH_SELECT = '[data-swatch-selector]';

// Attributes
const ATTR_POSITION = 'data-swatch-position';
const ATTR_VALUE = 'data-value';

const STRING_SOLD_OUT = ' - (sold out)';

// Methods
type FindParams = { container:HTMLElement };
export const swatchesFind = (params:FindParams) => {
  // Find the variant selector
  const variantSelector = variantSelectorFind(params);
  if(!variantSelector) return null;

  const swatches = swatchesCreate({
    swatchContainer: params.container, variantSelector
  });

  return swatches;
}

type CreateParams = WithSwatchContainer & WithVariantSelector;
const swatchesCreate = (params:CreateParams) => {
  const { swatchContainer, variantSelector } = params;

  const swatches = {
    ...params, options: [], groups: [], objects: [], selects: [],
    variantWatcher: variantSelectorWatch({
      ...params,
      variantChange: changeParams => {
        // On variant change, refresh swatches
        swatchesSetFromVariant({ swatches, ...changeParams })
      }
    })
  } as ProductSwatches;

  // Swatch groups
  const groups = swatchContainer.querySelectorAll<HTMLDivElement>(SELECTOR_SWATCH_GROUP);
  
  groups.forEach(group => {
    const objects = group.querySelectorAll<HTMLButtonElement>(SELECTOR_SWATCH_OBJ);
    const select = group.querySelector<HTMLSelectElement>(SELECTOR_SWATCH_SELECT);
    const positionOne = parseInt(group.getAttribute(ATTR_POSITION) || '');

    if(isNaN(positionOne)) return;
    const position = positionOne - 1;

    swatches.groups.push(group);

    // Button style
    objects.forEach(obj => {
      const value = obj.getAttribute(ATTR_VALUE);
      if(!value) return;
      swatches.objects.push(obj);

      obj.addEventListener('click', e => {
        e.preventDefault();
        swatchSetOptionValue({ swatches, position, value });
      });
    });

    // Select style
    if(select) {
      swatches.selects.push(select);
      select.addEventListener('change', e => {
        swatchSetOptionValue({ swatches, position, value: select.value });
      });
    }
  });

  // Update from current variant
  swatchesSetFromVariant({ swatches, ...variantSelector });

  return swatches;
}

type SetOptionValueParams = WithSwatches & { value:string; position:number };

export const swatchSetOptionValue = (params:SetOptionValueParams) => {
  const { swatches, value, position } = params;
  const { variantSelector } = swatches;
  const { product } = variantSelector;

  // How this works is that we are going to iterate over each of the options and
  // find a match where we can
  let selectedOptions:string[] = [];
  let matchFound = true;
  for(let i = 0; i < product.options.length; i++) {
    // Determine the value we're going to set
    let indexValue = i === position ? value : swatches.options[i];
    let selectedTemp = [ ...selectedOptions, indexValue ];

    // Determine if there's a match
    const match: Variant | undefined = variantGetFromOptions({ options:selectedTemp, product });
    if(match) {
      selectedOptions = selectedTemp;
      continue;
    }

    // Find first match for this index
    let firstMatchVariant = variantGetFromOptions({
      options: selectedOptions, product
    });

    if(firstMatchVariant) {
      selectedOptions = firstMatchVariant.options;
      break;
    }

    matchFound = false;
    break;
  }

  // Did we find a match?
  let variant:Variant;
  if(!matchFound) {
    console.error(`Failed to find a matching variant for swatch event`);
    variant = variantFirstAvailableOrDefault(product);
  } else {
    variant = (
      variantGetFromOptions({ options: selectedOptions, product }) ||
      variantFirstAvailableOrDefault(product)
    );
  }

  // Did we even do anything?
  if(variant.id === variantSelector.variant.id) return variant;

  return variantSelectorSetVariant({
    variantSelector, variantId: variant.id, product
  });
}

type SetFromVariantParams = WithSwatches & WithVariant & WithProduct;
export const swatchesSetFromVariant = (params:SetFromVariantParams) => {
  const { swatches, variant, product } = params;

  // Update the swatch options
  swatches.options = [ ...variant.options ];

  swatches.groups.forEach(group => {
    const objects = group.querySelectorAll<HTMLButtonElement>(SELECTOR_SWATCH_OBJ);
    const select = group.querySelector<HTMLSelectElement>(SELECTOR_SWATCH_SELECT);
    const positionOne = parseInt(group.getAttribute(ATTR_POSITION) || '');
    if(isNaN(positionOne)) return;

    const position = positionOne - 1;
    let selectedValue = handlize(swatches.options[position]);

    // Button style
    objects.forEach(obj => {
      const value = obj.getAttribute(ATTR_VALUE);
      if(value === selectedValue) {
        obj.classList.add(CLASS_SELECTED);
      } else {
        obj.classList.remove(CLASS_SELECTED);
      }
    });

    // Select style
    if(select && select.value != selectedValue) {
      select.value = selectedValue;
    }
  });

  updateAvailableSwatches(variant, swatches, product);
}

const updateAvailableSwatches = (variant:Variant, swatches:ProductSwatches, product:Product) => {
  //Variant = the currently available variant
  swatches.groups.forEach(group => {
    const positionOne = parseInt(group.getAttribute(ATTR_POSITION) || '');
    if(positionOne == 1) return;

    const objects = group.querySelectorAll<HTMLButtonElement>(SELECTOR_SWATCH_OBJ);
    const optionElements = group.querySelectorAll<HTMLOptionElement>(`${SELECTOR_SWATCH_SELECT} option`);
    //Make all sold out initially
    objects.forEach(swatchObject => swatchObject.classList.add(CLASS_SOLD_OUT));
    //Make all select options disabled out initially
    optionElements.forEach(optionElem => optionElem.setAttribute('disabled','disabled'))

    //Swatch select boxes
    const select = group.querySelector<HTMLSelectElement>(SELECTOR_SWATCH_SELECT);
    select?.querySelectorAll<HTMLOptionElement>('option').forEach(option => {
      const text = option.text;
      if(text && !text.includes(STRING_SOLD_OUT)) option.text = text + STRING_SOLD_OUT; 
    });
  });
  
  //Now go over reach option to determine visible swatches
  for(let i = 1; i < product.options.length; i++) {
    //Given the selected previous level, what options for *this* level are available?
    let prevOption = variant.options[i-1];

    let allowedOptionsForThisLevel: string[] = [];
    product.variants.forEach(v => {
      let n = v.options[i];

      //If current iterated variant has the same previous option AND is not already in the list of allowed values...
      if(allowedOptionsForThisLevel.indexOf(n) === -1 && v.options[i-1] == prevOption){
        allowedOptionsForThisLevel.push(n);//Add to list.
      }
    });

    allowedOptionsForThisLevel.forEach(ao => {
      let aos = `[data-swatch-position="${i+1}"]`;
      swatches.swatchContainer.querySelector(SELECTOR_SWATCH_OBJ+aos+`[data-value="${handlize(ao)}"]`)?.classList.remove('is-hidden');
      //Comment this out if you want to disable sold out select swatches

      // this isnt perfect because the swatch functions above is allowing you to select a swatch that doesnt return a variant
      const optionElem = swatches.swatchContainer.querySelector(SELECTOR_SWATCH_SELECT+aos+` [value="${handlize(ao)}"]`)
      optionElem?.removeAttribute('disabled');
    });
  }

  for(let i = 0; i <= product.options.length; i++) {
    let avail:any = {};//Stores availability of option[i]'s value.

    //Find if there are any variants for this option with stock available
    product.variants.forEach((v:Variant) => {
      //Check previous options match, since we don't want to check stock of
      //other levels
      let canUse = true;
      for(let y = 0; y < i; y++) {
        if(v.options[y] == variant.options[y]) continue;
        canUse = false;
        break;
      }
      if(!canUse) return;

      const n = v.options[i];
      avail[n] = avail[n] || v.available;
    });

    //Now remove these as sold out.
    let keys = Object.entries(avail).forEach(e => {
      let [ key, value] = e;
      if(!value) return;
      swatches.swatchContainer.querySelector(`${SELECTOR_SWATCH_OBJ}[${ATTR_POSITION}="${i+1}"][data-value="${handlize(key)}"]`)?.classList.remove(CLASS_SOLD_OUT);

      const optionElement = swatches.swatchContainer.querySelector<HTMLOptionElement>(`${SELECTOR_SWATCH_SELECT}[${ATTR_POSITION}="${i+1}"] [value="${handlize(key)}"]`);
      if(optionElement) optionElement.text = optionElement.text.replace(STRING_SOLD_OUT, '');
    });
  }

}