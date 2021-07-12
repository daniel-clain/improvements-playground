/*
 *  Product Template
 *    Scripts for the product template section
 *
 *  Version:
 *    1.0.0 - 2020/11/16
 */


import {
  CLASS_DISABLED, CLASS_EXPANDED, CLASS_HAS_COMPARE
} from '../../tools/constants/classes';
import { ATTR_DISABLED } from "../../tools/constants/attributes";
import * as Language from '../../tools/constants/language';
import { Variant } from '../../tools/product/variant';
import { swatchesFind } from '../../components/product/product-swatches';
import { variantSelectorWatch } from "../../objects/product/variant-selector";
import { generateLoader } from "../../objects/loader";
import {
  printMoney, t, setQueryParams, cartAdd, getCountOfVariantInCart,
  ON_CART_FINISHED
} from '@process-creative/slate-theme-tools';
import { openModal } from '../modal';
import { handleExcessColorSwatches } from './thumbnail-swatch-expand';

// Attributes
const ATTR_MONEY = 'data-money';
const ATTR_SCROLL_HANDLE = 'data-product-scroll-handle';
const ATTR_ACCORDION_SLIDE = 'data-accordion-slide';
const ATTR_NOTIFY_BTN = 'data-notify-btn';

// Selectors
const SELECTOR_TEMPLATE = '[data-product-template]';
const SELECTOR_PRICING = '[data-product-pricing]';
const SELECTOR_PRICE = '[data-product-money]';
const SELECTOR_PRICE_COMPARE = '[data-product-compare-money]';
const SELECTOR_BTN_ADD = '[data-add-to-cart-button]';
const SELECTOR_ACCORDION_TITLE = '[data-accordion-title]';
const SELECTOR_BIS_FORM = '[data-bis-form]';
const SELECTOR_BTN_INNER = '[data-add-to-cart-button-inner]';
const SELECTOR_STOCKBAR = '[data-stockbar]';
const SELECTOR_SIZE_GUIDE_LINK = '[data-size-guide-link]'

const win = window as Window & typeof globalThis & {Currency: {currency: string}}
const currency = win.Currency.currency || 'AUD'
const format = 'money_with_currency_format'

// Initialise template
document.querySelectorAll<HTMLElement>(SELECTOR_TEMPLATE).forEach(template => {
  // Elements
  const pricingElement = template.querySelector<HTMLElement>(SELECTOR_PRICING);
  const priceElement = template.querySelector<HTMLElement>(SELECTOR_PRICE);
  const priceCompareElement = template.querySelector<HTMLElement>(SELECTOR_PRICE_COMPARE);
  const buttonAdd = template.querySelector<HTMLButtonElement>(SELECTOR_BTN_ADD);
  const stockBar = template.querySelector<HTMLButtonElement>(SELECTOR_STOCKBAR);
  const buttonInner = buttonAdd ? buttonAdd.querySelector<HTMLElement>(SELECTOR_BTN_INNER) : null;
  const bisForm = template.querySelector<HTMLFormElement>(SELECTOR_BIS_FORM);

  setupSizeGuide()



  const updatePricing = (variant:Variant) => {
    if(!priceElement) return;

    let { price, compare_at_price } = variant;

    // Adjust price display
    if(!price || price <= 0) {
      priceElement.removeAttribute(ATTR_MONEY);
      priceElement.innerText = t(Language.PRODUCT_FREE);
    } else {
      priceElement.setAttribute(ATTR_MONEY, price.toString());
      priceElement.innerText = printMoney(price, format, currency).replace('.00','');
    }

    // Adjust compare price display
    if(!priceCompareElement || !pricingElement) return;

    if(!compare_at_price || compare_at_price <= 0) {
      pricingElement.classList.remove(CLASS_HAS_COMPARE);
      priceCompareElement.removeAttribute(ATTR_MONEY);
      priceCompareElement.innerText = '';
    } else {
      pricingElement.classList.add(CLASS_HAS_COMPARE);
      priceCompareElement.setAttribute(ATTR_MONEY, compare_at_price.toString());
      priceCompareElement.innerText = printMoney(compare_at_price, format, currency).replace('.00','');
    }
  }

  const btnDisable = () => {
    if(!buttonAdd || !buttonInner) return;
    buttonAdd.classList.add(CLASS_DISABLED);
    buttonAdd.setAttribute(ATTR_DISABLED, ATTR_DISABLED);
    buttonInner.innerHTML = t(Language.PRODUCT_SOLD_OUT);
  }
  const btnNotify = () => {
    if(!buttonAdd || !buttonInner) return;
    buttonAdd.removeAttribute(ATTR_DISABLED);
    buttonAdd.setAttribute(ATTR_NOTIFY_BTN, ATTR_NOTIFY_BTN);
    buttonInner.innerHTML = t(Language.PRODUCT_NOTIFY_ME);
  }

  const btnEnable = () => {
    if(!buttonAdd || !buttonInner) return;
    buttonAdd.classList.remove(CLASS_DISABLED);
    buttonAdd.removeAttribute(ATTR_DISABLED);
    buttonAdd.removeAttribute(ATTR_NOTIFY_BTN);
    buttonInner.innerHTML = t(Language.PRODUCT_ADD_TO_CART);
  }

  const btnAllInCart = () => {
    if(!buttonAdd || !buttonInner) return;
    buttonAdd.classList.add(CLASS_DISABLED);
    buttonAdd.setAttribute(ATTR_DISABLED, ATTR_DISABLED);
    buttonInner.innerHTML = t(Language.PRODUCT_ALL_IN_CART);
  }

  const updateAddToCart = (variant:Variant) => {
    if(!buttonAdd) return;

    // Adjust the add to cart button based on QTY available and in cart
    let inCart = getCountOfVariantInCart(variant.id);
    let { available, inventory_policy, inventory_management, inventory_quantity } = variant;
    if(!inventory_quantity) inventory_quantity = 0;

    if(available) {
      if(inventory_policy != 'continue' && inventory_management != null && (inventory_quantity - inCart) <= 0) {
        btnAllInCart();
      } else {
        btnEnable();
      }
    } else if(bisForm) {
      btnNotify();
    } else {
      btnDisable();
    }
  }

  // Swatches
  const swatches = swatchesFind({ container: template });
  if(!swatches) return;

  // On variant change
  variantSelectorWatch({
    variantSelector: swatches.variantSelector,
    variantChange: ({ variant }) => {
      // Update pricing
      updatePricing(variant);

      // Update add to cart
      updateAddToCart(variant);

      // Update url
      let url = setQueryParams({ variant: variant.id });
      let variantId = variant.id;
      history.replaceState({ variant, variantId }, document.title, url);
    }
  });

  // Set initial button state
  updateAddToCart(swatches.variantSelector.variant);

  // Add to cart button click
  if(buttonAdd) {
    let atcState:'adding'|'added'|'pending'|'error' = 'pending';
    buttonAdd.addEventListener('click', async e => {
      e.preventDefault();
      const variant = swatches.variantSelector.variant;
      if(buttonAdd.hasAttribute(ATTR_NOTIFY_BTN)){
        showNotifyBackInStockModal()
        return
      }
      const qty:number = 1;
      if(atcState !== 'pending' || !variant.available || qty <= 0) return;

      atcState = 'adding';
      btnDisable();

      if(buttonInner) buttonInner.innerHTML = generateLoader({size:26});

      try {
        let params = {items: [{ id:variant.id, quantity:1 }]}
        await cartAdd(params);
        atcState = 'added';
        if(buttonInner) buttonInner.innerHTML = t(Language.PRODUCT_ADDED_TO_CART);
      } catch(e) {
        alert(e);
        console.error(e);
        atcState = 'error';
        if(buttonInner) buttonInner.innerHTML = t(Language.PRODUCT_ERROR);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      atcState = 'pending';
      updateAddToCart(variant);
    });
  }

  function setupSizeGuide(){
    const sizeGuideLink = template.querySelector(SELECTOR_SIZE_GUIDE_LINK)!
    sizeGuideLink?.addEventListener('click', _ =>  openModal({modalContentName: 'sizeChart', maxWidth: 760}))

  }

  function showNotifyBackInStockModal(){
    openModal({modalContentName: 'backInStock'})
  }

  /*
    On cart finished - update the button. This takes the cart drawer
    into account
  */
  document.addEventListener(ON_CART_FINISHED, () => updateAddToCart(swatches.variantSelector.variant))
});
