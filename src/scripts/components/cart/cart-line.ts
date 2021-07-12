import { generateIcon, handlize, pictureGenerate, removeFromCart, t, updateCart } from '@process-creative/slate-theme-tools';
import { html,  unsafeHTML } from './../../tools/utilities/component';
import { shopifyAjaxErrorGet } from '../../tools/utilities/error';
import { quantitySelectorCreate } from '../../objects/product/quantity-selector';

type CartLineParams = {
  item:any;
  index:number;
  disabled?:boolean;
};

export const cartLineCreate = (p:CartLineParams) => {
  const ut = (s:string, variables?: {[key: string]: string}) => unsafeHTML(t(s, variables));

  const { item, index, disabled } = p;

  const realIndex = index + 1; // Thanks shopify.

  // Setup basic variables
  const url = item.url;
  const quantity = parseInt(item.quantity);
  const hasDiscount = item.original_line_price > item.final_line_price;


  // Event Listeners
  const eventRemoveClick = async(e:MouseEvent) => {
    e.preventDefault();
    try {
      await removeFromCart(realIndex);
    } catch (e) {
      console.error(shopifyAjaxErrorGet(e));
    }
  };

  const eventQuantityChange = async(newQuantity:number) => {
    if(newQuantity === quantity) return;

    try {
      await updateCart(realIndex, newQuantity)
    } catch(e) {
      console.error(shopifyAjaxErrorGet(e));
    }
  }

  // Generate the line item
  return html`
    <div class="c-cart-line">
      <div class="c-cart-line__row">
        <a href="${url}" class="c-cart-line__image-wrapper">
          <div class="c-cart-line__image-container o-responsive-image-container">
            ${unsafeHTML(pictureGenerate({
              class: 'c-cart-line__image o-responsive-image',
              src: item.image || '',
              srcSize: 200,
              sizes: [{ size: 150, screen: 375 }]
            }))}
          </div>
        </a>

        <div class="c-cart-line__container">
          <div class="c-cart-line__content">
            <a href="${url}" class="c-cart-line__title">
              ${item.product_title}
            </a>

            ${item.options_with_values.map((option: { name: string; value: string }) => {
              return html`
                <p class="c-cart-line__${handlize(option.name)} o-tags">
                  ${option.name.toLowerCase()}: ${option.value.toLowerCase()}
                </p>
              `
            })}
          </div>

        <div class="c-cart-line__details">
          <div class="c-cart-line__remove">
            <div class="c-cart-line__remove-inner" @click=${eventRemoveClick}>
              ${unsafeHTML(generateIcon('cross', 'c-cart-line__remove-icon'))}
            </div>
          </div>

          <div class="c-cart-line__quantity-wrapper">
            <div class="c-cart-line__quantity">
              ${quantitySelectorCreate({
                quantity, onChange: eventQuantityChange, min: 1, disabled
              })}
            </div>
          </div>

          <div class="c-cart-line__pricing o-type--4">
            ${hasDiscount ? html`
              <shop-money money="${item.final_line_price}" moneyclass="is-money"
                compare="${item.original_line_price}" compareclass="is-compare"
              >
              </shop-money>
            `: html`
              <shop-money money="${item.final_line_price}" moneyclass="is-money">
              </shop-money>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}