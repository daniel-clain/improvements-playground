/*
 *  Quantity Selector
 *    Define the upsell swatch component
 *
 *  Version:
 *    1.0.0 - 2021/05/07
 */

import { escapeString, generateIcon, handlize } from '@process-creative/slate-theme-tools';
import { CLASS_SELECTED, CLASS_EXPANDED } from '../../tools/constants/classes';
import { Product } from '../../tools/product/product';
import { Variant } from '../../tools/product/variant';
import { html, unsafeHTML } from '../../tools/utilities/component';
import { responsiveMediaAbove, responsiveMediaBelow, SMALL } from '../../settings/responsive';


type UpsellSwatchParams = {
  product: Product,
  variant: Variant
};

const SELECTOR_UPSELL_BTN = '[data-upsell-add]';
const SELECTOR_UPSELL_ITEM = '[data-upsell-item]';
const SELECTOR_VARIANT_SEL = '[data-variant-selector]';
const SELECTOR_COLOR_SWATCH = '[data-color-swatch]'

const ATTR_SWATCH_POSITION = 'data-swatch-position';
const ATTR_VALUE = 'data-value';

export const upsellSwatchCreate = ({ product, variant }: UpsellSwatchParams) => {
  /**
   * Make updates based on new variant update
   */
   const onVariantUpdate = (upsellContainer: Element, currVariantEl: HTMLSelectElement, variant: Variant | undefined) => {
    // Disable button if not available
    const upsellBtn = upsellContainer.querySelector(SELECTOR_UPSELL_BTN);

    if (!variant?.available || !variant) {
      upsellBtn?.setAttribute('disabled', 'disabled');
    } else {
      upsellBtn?.removeAttribute('disabled');
      currVariantEl.value = variant.id.toString();
    }

    // Update price
    const priceContainer = upsellContainer.querySelector('shop-money');
    if (!priceContainer || !variant) return;

    let price = variant.price;
    let compareAtPrice = variant.compare_at_price ? variant.compare_at_price : null;  
    const hasDiscount = compareAtPrice && (compareAtPrice > price);

    /**
     * The product recommendations api returs a different object then our own custom
     * object. The two objects return different price formats. The below if statements
     * attempt to account for those diffent formats
     */
    if (compareAtPrice && compareAtPrice.toString().includes('.')) {
      compareAtPrice = compareAtPrice * 100
    }
  
    if (price.toString().includes('.')) {
      price = variant.price * 100;
    }

    priceContainer.setAttribute('money', price.toString());
    priceContainer.setAttribute('moneyclass', 'is-money');

    if (hasDiscount && compareAtPrice) {
      priceContainer.setAttribute('compare', compareAtPrice.toString());
      priceContainer.setAttribute('compareclass', 'is-compare');
    } else {
      priceContainer.removeAttribute('compare');
    }
  }

  /**
   * Only used when the fallback variant selector is changed
   * @param e 
   * @returns 
   */
  const variantSelectUpdate = (e: Event) => {
    let target = e.target as HTMLElement;
    const upsellContainer = target.closest(SELECTOR_UPSELL_ITEM);
    const currVariantEl = upsellContainer?.querySelector(SELECTOR_VARIANT_SEL) as HTMLSelectElement;
    if (!upsellContainer || !currVariantEl) return;

    // Try and find new variant match
    const variant = product.variants.find(v => v.id === Number(currVariantEl.value));  
    onVariantUpdate(upsellContainer, currVariantEl, variant);
  }

  /**
   * Base variant selector used for fallback and to store selected variant
   * @param isVisible
   */
  const getVariantSelector = (isVisible: boolean) => {
    const options = product.variants.reduce((x, v) => {
      return x += `
        <option 
          value="${v.id}" ${variant.id == v.id ? `selected` : ``}
          ${(v.option1 != null) ? `data-option1="${handlize(v.option1)}"` : ''}
          ${(v.option2 != null) ? `data-option2="${handlize(v.option2)}"` : ''}
          ${(v.option3 != null) ? `data-option3="${handlize(v.option3)}"` : ''}
          data-variant-option
        >
          ${escapeString(v.title)}
        </option>`;
    }, '')

    return html`
      <select
        class="o-variant-selector o-select o-swatches__swatch-select ${!isVisible && 'is-hidden'}
        o-input is-primary"
        data-variant-selector data-id="${variant.id}"
        @change=${variantSelectUpdate}
      >
        ${unsafeHTML(options)}
      </select>
    `
  }

  // Check if we have colour or size options else use fallback selector
  const tempColor = product.options.find(option => option.name.toLowerCase() === 'colour' || option.name.toLowerCase() === 'color');
  const tempSize = product.options.find(option => option.name.toLowerCase() === 'size');

  // Fallback variant selector
  if ((!tempColor || !tempSize) || variant.option3 ) {
    return html`
    <div class="o-swatches" data-swatches>
      <div class="o-swatches__variant-selector">
        ${getVariantSelector(true)}
      </div>
    </div>
  `;
  }

  // Setup variables
  const colorIndex = tempColor.position;
  const colorIndex0 = tempColor.position - 1;
  const colorName = tempColor.name;
  const variantColor = variant.options[colorIndex0];

  const sizeIndex = tempSize.position;
  const sizeIndex0 = tempSize.position - 1;
  const sizeName = tempSize.name;
  const variantSize = variant.options[sizeIndex0];

  let options = [] as string[];
  options[colorIndex0] = handlize(variantColor);
  options[sizeIndex0] = handlize(variantSize);


  /**
   * When a swatch is updated, find correct variant
   */
  const swatchUpdate = (e: Event) => {
    let target = e.target as HTMLElement;
    const upsellContainer = target.closest(SELECTOR_UPSELL_ITEM);

    if (!upsellContainer) return;

    // Handle size or color
    if (target.tagName === 'SELECT') {
      const targetOption = e.target as HTMLSelectElement;
      target = targetOption.options[targetOption.selectedIndex];
    } else {
      if (!target.parentElement) return;

      Array.from(target.parentElement.children).forEach(el => {
        el.classList.remove(CLASS_SELECTED);
      });

      target.classList.add(CLASS_SELECTED);
    }

    const index = Number(target.getAttribute(ATTR_SWATCH_POSITION));
    const value = target.getAttribute(ATTR_VALUE);
    const currVariantEl = upsellContainer.querySelector(SELECTOR_VARIANT_SEL) as HTMLSelectElement;
    const currVariant = currVariantEl.options[currVariantEl.selectedIndex];

    // Set new value
    if (index === null || !value || !currVariant) return;
    options[index - 1] = value;

    const variantColorIndex = 'option' + colorIndex.toString() as 'option1' | 'option2' | 'option3';
    const variantSizeIndex = 'option' + sizeIndex.toString() as 'option1' | 'option2' | 'option3';

    // Try and find new variant match
    const variant = product.variants.find(
      v => handlize(v[variantColorIndex] || '') === options[colorIndex0] &&
        handlize(v[variantSizeIndex] || '') === options[sizeIndex0]
    );

    onVariantUpdate(upsellContainer, currVariantEl, variant);
  }

  /**
   * Create our size swatch as dropdown
   */
  const getSizeSwatch = () => {
    const isSelectedVariant = (option: string) => {
      return option === variantSize;
    }

    const sizeSwatch = product.options[sizeIndex - 1].values.map((value: string, i: number) => {
      return html`
        <option
          value="${handlize(value)}"
          class="o-swatches__swatch-option"
          ?selected = ${isSelectedVariant(value)}
          data-swatch-object
          data-swatch-position=${sizeIndex}
          data-value="${handlize(value)}"
        >
          ${value.toLowerCase()}
        </option>
      `;
    }, '');

    return html`
      <div class="o-swatches__swatch is-size" data-swatch>
        <div class="o-swatches__swatch-options o-form__input-group is-dropdown"
          data-swatch-group
          data-swatch-position="${sizeIndex}"
          data-index="option${sizeIndex}"
          data-swatch-option-name="${sizeName}"
        >
          <select
            class="o-swatches__swatch-select-inner
              o-input
              is-secondary
              o-form__input"
            data-swatch-selector
            @change=${swatchUpdate}
          >
            ${sizeSwatch}
          </select>
        </div>
      </div>
    `
  }

  /**
   * Create our colour swatch
   */
  const getColorSwatch = () => {
    const drawerWidth = 480;
    let showCount = 4;

    if (window.innerWidth < drawerWidth) {
      showCount = 4;
    } else if (window.innerWidth >= drawerWidth && responsiveMediaBelow('MEDIUM')) {
      showCount = 7;
    } else {
      showCount = 5;
    }

    let swatchCount = 0;
    const isSelectedVariant = (option: string) => option === variantColor;

    const colorSwatch = product.options[colorIndex - 1].values.map((value: string, i: number) => {
      swatchCount++;
      return html`
        <button
          type="button"
          class="o-swatches__swatch-button
          ${isSelectedVariant(value) ? ' is-selected' : ''}"
          data-swatch-object
          data-value="${handlize(value)}"
          data-swatch-position="${colorIndex}"
          title="${value}"
          @click=${swatchUpdate}
        >
          <div class="o-swatches__swatch-button-inner s-swatch--${handlize(value)}">
          </div>
        </button>
      `
    }, '');

    const toggleSwatches = () => {
      if (swatchCount > showCount) {
        return html`
          <button
            type="button"
            title="Show more colours"
            class="o-swatches__expand"
            @click=${(e: MouseEvent) => {
              document.querySelector(SELECTOR_COLOR_SWATCH)?.classList.toggle(CLASS_EXPANDED);
            }}
          >
            ${unsafeHTML(generateIcon('arrow--right--black', `o-swatches__expand-icon`))}
          </button>
        `;
      } else {
        return '';
      }
    };

    return html`
      <div class="o-swatches__swatch is-color" data-swatch data-color-swatch>
        <div class="o-swatches__swatch-options"
          data-swatch-options
          data-swatch-position="${colorIndex}"
          data-index="option${colorIndex}"
          data-swatch-option-name="${colorName}"
        >
          ${colorSwatch}
        </div>

        ${toggleSwatches()}
      </div>
    `;
  }

  return html`
    <div class="o-swatches" data-swatches>
      <div class="o-swatches__variant-selector">
        ${getVariantSelector(false)}

        ${getColorSwatch()}

        ${getSizeSwatch()}
      </div>
    </div>
  `;
}
