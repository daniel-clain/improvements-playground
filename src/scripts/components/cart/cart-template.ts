import {
  getCurrentCart, ON_CART_FINISHED, t, printMoney, removeFromCart, updateCart 
} from '@process-creative/slate-theme-tools';

//@ts-ignore
import $ from 'jquery';
import { variantSelectorWatch } from '../../objects/product/variant-selector';
import { CLASS_HAS_COMPARE, CLASS_HIDDEN } from '../../tools/constants/classes';
import { swatchesFind } from '../product/product-swatches';
import * as Language from '../../tools/constants/language';
import { openModal } from '../modal';

//Attributes
const CART_INDEX = 'data-index';
const CART_SHIPPING_MIN = 'data-shipping-min';
const ATTR_MONEY = 'data-money';

//Selectors
const CART_CONTAINER = '[data-cart-template]';
const CART_LINE = '[data-cart-line]';
const CART_LINE_CONTAINER = '[data-cart-line-container]';
const CART_PRODUCT_REMOVE = '[data-cart-remove]';
const CART_SUBTOTAL = '[data-cart-subtotal]';

const CART_ORIGINAL_SUBTOTAL = '[data-cart-subtotal-original]';
const CART_SHIPPING_PROGRESS = '[data-shipping-progress-container]';
const CART_SHIPPING_PROGRESS_BAR = '[data-shipping-progress-bar]';
const CART_SHIPPING_LABEL = '[data-shipping-label]';

const CART_QUANTITY_CONTAINER = '[data-quantity-selector]';
const CART_QUANTITY_PLUS = '[data-quantity-selector-plus]';
const CART_QUANTITY_MINUS = '[data-quantity-selector-minus]';
const CART_QUANTITY = '[data-quantity-selector-field]';

const CART_UPSELL_CONTAINER = '[data-cart-upsell]';
const CART_UPSELL_ITEM = '[data-upsell-item]';
const CART_UPSELL_ADD = '[data-upsell-add]';

const SELECTOR_PRICING = '[data-product-pricing]';
const SELECTOR_PRICE = '[data-product-money]';
const SELECTOR_PRICE_COMPARE = '[data-product-compare-money]';

const SELECTOR_SHIPPING_BTN = '[data-info-popup-btn]';

//Classes
const CLASS_UPSELL_HIDDEN = 'is-upsell-hidden'

const cartContainer = document.querySelectorAll<HTMLElement>(CART_CONTAINER);

cartContainer.forEach(container => {
  let cartFetching = false;
  const upsellItems = container.querySelectorAll(CART_UPSELL_ITEM);

  if (!upsellItems || upsellItems.length === 0) {
    container.classList.add(CLASS_UPSELL_HIDDEN);
    return;
  }

  upsellItems.forEach(el => {
    const swatches = swatchesFind({ container: el as HTMLElement });
    if (!swatches) return;

    // Update price on variant change
    variantSelectorWatch({
      variantSelector: swatches.variantSelector,
      variantChange: ({ variant }) => {
        const priceElement = el.querySelector<HTMLElement>(SELECTOR_PRICE);
        const pricingElement = el.querySelector<HTMLElement>(SELECTOR_PRICING);
        const priceCompareElement = el.querySelector<HTMLElement>(SELECTOR_PRICE_COMPARE);
        const addButton = el.querySelector<HTMLButtonElement>(CART_UPSELL_ADD);

        if (addButton) addButton.disabled = !variant.available;
        if(!priceElement) return;

        let { price, compare_at_price } = variant;

        // Adjust price display
        if(!price || price <= 0) {
          priceElement.removeAttribute(ATTR_MONEY);
          priceElement.innerText = t(Language.PRODUCT_FREE);
        } else {
          priceElement.setAttribute(ATTR_MONEY, price.toString());
          priceElement.innerText = printMoney(price).replace('.00', '');
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
          priceCompareElement.innerText = printMoney(compare_at_price).replace('.00', '');
        }
      }
    })
  });

  const onCartFetched = (html: string) => {
    cartFetching = false;

    const cartLines = container.querySelector(CART_LINE_CONTAINER);
    if (!cartLines) return;
    cartLines.outerHTML = html;

    let cart = getCurrentCart();
    let subtotal = cart.items_subtotal_price;
    let original = cart.original_total_price;

    //Update subtotal
    const subtotalEl = container.querySelector(CART_SUBTOTAL);
    if (!subtotalEl) return;
    subtotalEl.innerHTML = formatMoneyCart(subtotal);

    //Update original total and show if needed
    const originalEl = container.querySelector(CART_ORIGINAL_SUBTOTAL);
    if (!originalEl) return;
    originalEl.innerHTML = formatMoneyCart(original);

    if (original > subtotal) {
      originalEl.classList.remove(CLASS_HIDDEN);
    } else {
      originalEl.classList.add(CLASS_HIDDEN);
    }

    //Update our cart progress bar
    updateProgress(subtotal);

    addHandlers();
  }

  const updateProgress = (subtotal: number) => {
    const progressContainer = container.querySelector(CART_SHIPPING_PROGRESS);
    const label = container.querySelector(CART_SHIPPING_LABEL);
    if (!progressContainer || !label) return;

    const minShipping = Number(progressContainer.getAttribute(CART_SHIPPING_MIN));
    const percent = Math.min((subtotal / minShipping) * 100, 100);
    const bar = progressContainer.querySelector(CART_SHIPPING_PROGRESS_BAR);

    bar?.setAttribute("style", `width: ${percent}%`);

    if (subtotal >= minShipping) {
      label.innerHTML = t('cart.free_shipping_unlocked');
      bar?.classList.add('is-full');
    } else {
      label.innerHTML = t('cart.free_shipping_remaining', {
        remaining: formatMoneyCart(minShipping - subtotal, false)
      });
    }
  }

  const formatMoneyCart = (money: number, currency: boolean = true) => {
    return String(printMoney(money,
      currency ? 'money_format_with_currency' : 'money_format')).replace('.00', '');
  }

  const onCartFinished = async () => {
    if (cartFetching) return;
    cartFetching = true;

    //Fetch the AJAX view for the cart
    try {
      const cartData = await fetch('/cart?view=lines', {
        method: 'GET'
      }).then(res =>
        res.text()
      );

      if (!cartData || !cartData.length) return;

      onCartFetched(cartData);
    } catch (e) {
      console.error(e);
    }
  }

  const removeItem = (e: Event, index: string) => {
    e.preventDefault();
    e.stopPropagation();

    //Now remove Item
    try {
      removeFromCart(Number(index));
    } catch (e) {
      console.error(e);
    }

    onCartFinished();
  }

  const eventQuantityChange = async (e: Event, realIndex: number,
    newQuantity: number, min: Number, max: Number) => {

    e.preventDefault();
    e.stopPropagation();

    if (newQuantity < min || newQuantity > max) return;

    try {
      await updateCart(realIndex, newQuantity)
    } catch (e) {
      console.error(e);
    }
  }

  const addHandlers = () => {
    const cartLines = container.querySelectorAll<HTMLElement>(CART_LINE);
    const shippingInfoClick = container.querySelector<HTMLElement>(SELECTOR_SHIPPING_BTN);

    shippingInfoClick?.addEventListener('click', _ => openModal({modalContentName: 'shippingInfo'}));

    // Cart line handlers
    cartLines?.forEach(cartLine => {
      const removeButton = cartLine.querySelector<HTMLElement>(CART_PRODUCT_REMOVE);
      const plusButton = cartLine.querySelector<HTMLElement>(CART_QUANTITY_PLUS);
      const minusButton = cartLine.querySelector<HTMLElement>(CART_QUANTITY_MINUS);
      const quantityContainer = cartLine.querySelector<HTMLElement>(CART_QUANTITY_CONTAINER);
      const quantityEl = cartLine.querySelector<HTMLElement>(CART_QUANTITY) as HTMLInputElement;
      const index = cartLine.getAttribute(CART_INDEX);

      if (!index || !removeButton) return;
      removeButton.addEventListener('click', e => removeItem(e, index));

      if (!plusButton || !minusButton || !quantityEl || !quantityContainer) return;
      const min = Number(quantityContainer.getAttribute('min'));
      const max = Number(quantityContainer.getAttribute('max'));
      const realIndex = Number(index);
      const quantity = Number(quantityEl.value);

      plusButton.addEventListener('click', e => eventQuantityChange(e, realIndex, quantity + 1, min, max));
      minusButton.addEventListener('click', e => eventQuantityChange(e, realIndex, quantity - 1, min, max));
    });
  }

  $(document).on(ON_CART_FINISHED, onCartFinished);

  addHandlers();
});