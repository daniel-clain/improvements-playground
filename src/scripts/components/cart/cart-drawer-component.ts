import { component, componentAddEventListener, html, unsafeHTML, useEffect, useState } from "../../tools/utilities/component";
import { generateIcon, getCurrentCart, ON_CART_FINISHED, ON_CART_PENDING, t } from '@process-creative/slate-theme-tools';
import { cartLineCreate } from "./cart-line";
import { CLASS_IS_EMPTY } from './../../tools/constants/classes';
import { Product } from "../../tools/product/product";
import { cartUpsellCreate, storeUpsellProduct } from './cart-upsell';
import { collectionGetUrlFromHandle } from "../../tools/product/collection";
import { shippingProgressBarCreate } from "./cart-shipping-progress";

// Attributes
const ATTR_DRAWER = 'data-cart-drawer';
const ATTR_MIN_SPEND = 'data-shipping-min-spend';
const ATTR_UPSELL = 'data-drawer-upsell';
const ATTR_EMPTY_BUTTONS = 'data-empty-buttons';
const ATTR_EMPTY_COLLECTIONS = 'data-empty-collections';

component({
  name: 'cart-drawer',
  attributes: [ATTR_DRAWER, ATTR_MIN_SPEND, ATTR_UPSELL,
    ATTR_EMPTY_BUTTONS, ATTR_EMPTY_COLLECTIONS],
  class: 'c-cart-drawer',
  render: self => {
    // Shorthand methods
    const ut = (s: string, variables?: { [key: string]: string }) => unsafeHTML(t(s, variables));

    // Attributes
    const minSpendAttr = self.getAttribute(ATTR_MIN_SPEND);
    const upsellAttr = self.getAttribute(ATTR_UPSELL);
    const emptyButtons = self.getAttribute(ATTR_EMPTY_BUTTONS)?.split(',') || [];
    const emptyCols = self.getAttribute(ATTR_EMPTY_COLLECTIONS)?.split(',') || [];

    // State
    const [cart, setCart] = useState(getCurrentCart());
    const [pending, setPending] = useState(false);
    const [upsellProduct, setUpsellProduct] = useState<Product | null>(null);

    // Listen for changes to the cart and update the state to reflect
    componentAddEventListener(ON_CART_PENDING, e => setPending(true));
    componentAddEventListener(ON_CART_FINISHED, e => {
      setCart(getCurrentCart());
      setPending(false);
    });

    // Generate upsell
    const itemProductId = cart.items.length > 0 ? cart.items[0].product_id : 0;
    const updateUpsell = async () => {
      const storedUpsellProduct = await storeUpsellProduct(upsellAttr, itemProductId, cart.items);
      setUpsellProduct(storedUpsellProduct);
    }

    useEffect(() => {
      updateUpsell();
    }, [cart]);

    let cartUpsell = cartUpsellCreate(upsellProduct);

    // Generate shipping progress bar
    let shippingBar = shippingProgressBarCreate(minSpendAttr, cart.items_subtotal_price);

    // Set drawer empty class
    if (cart.item_count <= 0) {
      self.classList.add(CLASS_IS_EMPTY);
      cartUpsell = '';
    } else {
      self.classList.remove(CLASS_IS_EMPTY);
    }

    // Generate the cart line items
    const items = cart.items as any[];
    const countPostfix = items.length > 1 ? ut('cart.count_postfix_plural') : ut('cart.count_postfix');
    const cartLines = cart.item_count ? html`
      <div class="c-cart-drawer__lines-container">
        <div class="c-cart-drawer__lines" data-cart-lines>
          ${items.map((item, index) => cartLineCreate({
            item, index, disabled: pending
          }))}
        </div>
      </div>
    ` : html`
      <div class="c-cart-empty">
        <p class="c-cart-empty__heading o-type--4">
          ${ut('cart.empty_heading')}
        </p>
        
        ${emptyButtons.map((button, index) => {
          // Check if mf was empty
          if (button === 'null' || emptyCols[index] === 'null') return;
          return html`
            <a href="${collectionGetUrlFromHandle(emptyCols[index])}" 
              class="c-cart-empty__btn o-btn is-primary"
            >
              ${button}
            </a>
          `
        })}
      </div>
    `;

    return html`
      <header class="c-cart-drawer__header">
        <div class="c-cart-drawer__header-inner">
          <p class="c-cart-drawer__title o-type--2">
            <span class="c-cart-drawer__title-label">
              ${ut('cart.title')}
            </span>

            <span
              class="c-cart-drawer__title-count ${cart.item_count <= 0 ? 'is-hidden' : ''}"
              data-cart-drawer-item-count
            >
              ${cart.item_count} ${countPostfix}
            </span>
          </p>

          <span class="c-cart-drawer__close" data-cart-drawer-toggle>
            ${unsafeHTML(generateIcon('cross', `c-cart-drawer__close-icon`, 'Close Cart', 'Close Cart'))}
          </span>
        </div>

        ${shippingBar}
      </header>

      <div class="c-cart-drawer__inner">
        <div class="c-cart-drawer__container">
          ${cartLines}
        </div>
      </div>

      <footer class="c-cart-drawer__footer">
        <div class="c-cart-drawer__footer-inner">
          <div class="c-cart-drawer__subtotal-row">
            <p class="c-cart-drawer__subtotal o-type--4">
              ${t('cart.subtotal')}
              <shop-money money="${cart.items_subtotal_price}"></shop-money>
            </p>
          </div>

          <div class="c-cart-drawer__btn-row">
            <a href="/checkout"
              class="c-cart-drawer__btn is-checkout-btn o-btn is-secondary"
            >
              <span class="o-btn__inner">
                ${ut('cart.go_to_checkout')}
              </span>

              ${unsafeHTML(generateIcon('lock', `c-cart-drawer__checkout-icon`))}
            </a>

            <a href="/cart"
              class="c-cart-drawer__btn is-tertiary o-btn"
            >
              ${ut('cart.view_cart')}
            </a>
          </div>
        </div>

        ${cartUpsell}
      </footer>
    `;
  }
});