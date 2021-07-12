import { cartAdd, pictureGenerate, setQueryParams, t } from '@process-creative/slate-theme-tools';
import { html, unsafeHTML } from './../../tools/utilities/component';
import { Product } from '../../tools/product/product';
import { variantGetUrl, variantFirstAvailable } from '../../tools/product/variant';
import { upsellSwatchCreate } from '../../objects/product/upsell-swatch';

const fetchUpsellProduct = async (url: string, cartItems: Product[]) => {
  let products: Product[] | null;

  try {
    const response = await fetch(url).then(response => response.json());
    products = response.products as Product[];
  } catch (error) {
    console.error(error);
    return null;
  }

  /**
   * If the products are fetched successfully, search through them and find a product
   * that isn't currently in the cart. If we can't find a product not in cart,
   * return null instead
   */
  if (products) {
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const inCart = product.variants.some((v) => cartItems.some(i => i.id === v.id));
      const availableVariant = variantFirstAvailable({ variants: product.variants });

      if (!inCart && availableVariant) return product;
    }
  }

  return null;
}

export const storeUpsellProduct = async (
  collectionHandle: string | null,
  productId: number | null,
  cartItems: any[]
) => {
  let fetchUrl: string = '';
  let limit = 8;
  let upsellProduct: Product | null = null;

  if (collectionHandle) {
    fetchUrl = `/collections/${collectionHandle}/products.json?limit=${limit}`;
    upsellProduct = await fetchUpsellProduct(fetchUrl, cartItems);
  }

  if (!upsellProduct) {
    fetchUrl = `/recommendations/products.json?product_id=${productId}&limit=${limit}`;
    upsellProduct = await fetchUpsellProduct(fetchUrl, cartItems);
  }

  return upsellProduct;
}

export const cartUpsellCreate = (upsellProduct: Product | null) => {
  if (!upsellProduct) return '';

  const variant = variantFirstAvailable({ variants: upsellProduct.variants });
  if (!variant) return '';

  const url = variantGetUrl({ variant, product: upsellProduct });

  // We convert to cents here so that we can easily use the shop-money component
  let price = variant.price;
  let compareAtPrice = variant.compare_at_price ? variant.compare_at_price : null;

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

  const hasDiscount = compareAtPrice && (compareAtPrice > price);

  // Set image
  let image = upsellProduct.images && upsellProduct.images.length > 0 ? upsellProduct.images[0].src : '';
  /**
   * This is gross, I know. But it's because the recommendations api is different
   * then our typed product definition. This is a little hack to get around this for this
   * specific instance.
   */
  if (!image) image = upsellProduct.images[0] as unknown as string;

  // Shopify's native variant spec doesn't include "options". So we'll update it
  variant.options = [
    variant.option1,
    variant.option2 ? variant.option2 : '',
    variant.option3 ? variant.option3 : ''
  ];

  // Filter out empty options
  variant.options = variant.options.filter((o) => o);

  const upsellClick = async (e: Event) => {
    const el = e.target as HTMLElement;
    const upsellContainer = el.closest('[data-upsell-item]');
    const currVariantEl = upsellContainer?.querySelector('[data-variant-selector]') as HTMLSelectElement;
    const currVariant = currVariantEl.options[currVariantEl.selectedIndex].value;

    try {
      await cartAdd({ items: [{ id: Number(currVariant), quantity: 1 }] });
    } catch (e) {
      console.error(e);
      return;
    }
  }

  return html`
    <div class="c-cart-upsell">
      <div class="c-cart-upsell__items">
        <div class="c-cart-upsell__item" data-upsell-item>
          <div class="c-cart-upsell__content">
            <a href="${url}" class="c-cart-upsell__image-wrapper">
              <div class="c-cart-upsell__image-container o-responsive-image-container">
                ${unsafeHTML(pictureGenerate({
                  class: 'c-cart-upsell__image o-responsive-image',
                  src: image || '',
                  srcSize: 100,
                  sizes: [{ size: 75, screen: 375 }]
                }))}
              </div>
            </a>
          </div>

          <div class="c-cart-upsell__btn-container">
            <div class="c-cart-upsell__centre">
              <a href="${url}" class="c-cart-upsell__details">
                <p class="c-cart-upsell__name o-tags">
                  ${upsellProduct.title}
                </p>
              </a>

              ${upsellSwatchCreate({ product: upsellProduct, variant: variant })}
            </div>

            <div class="c-cart-upsell__right">
              <button class="c-cart-upsell__btn" @click=${upsellClick} data-upsell-add>
                <span class="c-cart-upsell__btn-text o-tags">
                  ${t('cart.add')}
                </span>

                <span class="c-cart-upsell__btn-icon-container">
                  ${unsafeHTML('<svg class="c-cart-upsell__btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3.333v9.334M3.332 8h9.333"/></svg>')}
                </span>
              </button>

              <div class="c-cart-upsell__pricing o-tags">
                ${hasDiscount ? html`
                  <shop-money money="${price}" moneyclass="is-money"
                    compare="${compareAtPrice}" compareclass="is-compare"
                    currency="${false}"
                  >
                  </shop-money>
                `: html`
                  <shop-money money="${price}" moneyclass="is-money"
                    currency="${false}"
                  >
                  </shop-money>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}