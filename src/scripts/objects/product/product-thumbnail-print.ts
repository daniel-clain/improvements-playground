/*
 *  Product Thumbnail Print
 *    Exporting common product thumbnail string.
 *
 *
 *  Version:
 *    1.0.0 - 2020/10/28
 */

import {
  handlize,
  pictureGenerate, printMoney, t
} from '@process-creative/slate-theme-tools';
import * as Language from '../../tools/constants/language';
import { Product } from '../../tools/product/product';
import { Variant } from '../../tools/product/variant';

/**
 * The parameters for the product thumbnail print functionality
 */
export type ProductThumbnailPrintParams = {
  p:Product;
  p2:Product;
  v:Variant;
  clazz:string;
}

/**
 * Creates a product thumbnail based on provided product object data
 * @param params The information necessary to display the product thumbnail
 * @returns string of html to be renedered
 */
export const ProductThumbnailPrint = (params:ProductThumbnailPrintParams) => {
  const { p, p2, v, clazz } = params;

  const win = window as Window & typeof globalThis & {Currency: {currency: string}}
  const currency = win.Currency.currency || 'AUD'
  const format = 'money_with_currency_format'



  return /*html*/`
    <div
      class="o-product-thumbnail ${clazz || ''}"
      data-product-thumbnail
      data-product-id="${p.id}" 
      data-variant-id="${v.id}"
    >
      <a href="${p.url}" class="o-product-thumbnail__inner">
      ${featureBadge()}
        ${image()}
        <div class="o-product-thumbnail__details">
          ${title()}
          ${pricing()}
        </div>
        ${colourOptions()}
      </a>
    </div>
  `;

  
  function featureBadge(){
    const icon = p.primaryFeatureIcon
    return !icon || !icon.name || !icon.url ? '' : /* html */`
      <div class="o-product-thumbnail__primary-feature o-primary-feature-icon">
        <img 
          class="o-primary-feature-icon__image" 
          src="${icon.url}" 
          alt="${icon.name}"
        />
        <div class="o-primary-feature-icon__title">
          ${icon.name}
        </div>
      </div>
    `;
  }

  function image() {
    return /* html */`
      <div class="o-product-thumbnail__image-container o-responsive-image-container">
        ${pictureGenerate({
          class: `o-product-thumbnail__image o-responsive-image`,
          src: p.image || '',
          srcSize: 520,
          sizes: [
            { size: 374, screen: 280 }, 
            { size: 750, screen: 450 }, 
            { size: 1000, screen: 420 }, 
            { size: 1650, screen: 430 }
          ]
        })}
      </div>
    `
  }

  function title() {
    return /* html */`
      <div class="o-product-thumbnail__titles">
        <h3
          title="${p.title}"
          class="o-product-thumbnail__title o-type--2"
        > 
          ${p.title}
        </h3>

        ${p.subheading ? /* html */`
          <p class="o-product-thumbnail__subtitle o-type--2">
            ${p.subheading}
          </p>` : ''}
      </div>
    `
  }

  function pricing() {
    const comparePrice = v.compare_at_price!
    return /* html */`
    <p
      class="o-product-pricing o-product-thumbnail__price o-type--2 ${comparePrice ? 'has-compare' : ''}"
      data-product-pricing
    >
      ${comparePrice > v.price ? /*html*/`
        <span
          class="o-product-thumbnail__price-compare" 
          data-product-compare-money
          data-currency
          data-money="${comparePrice}"
        >
          ${ printMoney(comparePrice, format, currency).replace('.00','') }
        </span>
      `: ''}

      ${v.price == 0 ? /* html */`
        <span
          class="o-product-thumbnail__price-price"
          data-currency
          data-product-money
        >
          FREE
        </span>`
         : /* html */ `
        <span
          class="o-product-thumbnail__price-price ${comparePrice ? 'has-compare' : ''}"
          data-currency
          data-money="${v.price}"
          data-product-money
        >
          ${ printMoney(v.price, format, currency).replace('.00','') }
        </span>`
      }
    </p>`
  }


  function colourOptions(){
    const colorOptions = Object.values(p.options_with_values).find(o => ['color', 'colour'].includes(o!.name.toLowerCase()))?.values
    if(!colorOptions) return
    return /* html */`
      <div class="o-product-thumbnail__colour-options">
        
        <div class="o-swatches__swatch is-color" data-colour-container>
          <div class="o-swatches__swatch-options">
            ${colorOptions?.map((option: any, i: number) => {
              return /* html */ `
                <button
                  data-colour-swatch-button
                  class="o-swatches__swatch-button"
                  title="${option}"
                >
                  <div class="o-swatches__swatch-button-inner s-swatch--${handlize(option)}">
                  </div>
                </button>
              `
            }).join('')}
          </div>
          <button class="o-btn is-reset o-colour-expand-toggle" data-colour-expand-toggle title="Show more colours"></button>
        </div>
      </div>
    `
  }
  

};
