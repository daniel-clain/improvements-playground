import { ajaxRequest } from "@process-creative/slate-theme-tools";
import { handleExcessColorSwatches } from "./thumbnail-swatch-expand";

const productRecommendationsContainer = document.querySelector<HTMLElement>('[data-product-recommendations]');

if(productRecommendationsContainer)(async () => {

  let products = await getProductHtml();

  const productLoopElement = document.querySelector('[data-products-carousel-carousel]');
  
  if(products && productLoopElement){
    products.forEach(p => productLoopElement.appendChild(p));
  }
  handleExcessColorSwatches(productRecommendationsContainer)



  //implementation

  async function getProductHtml(): Promise<HTMLElement[] | null>{

    const productId = document.querySelector<HTMLElement>('[data-product-id]')?.getAttribute('data-product-id')

    return ajaxRequest('/recommendations/products','GET', {
      section_id: 'product-recommendations--products',
      product_id: `${productId}`,
      limit: 4
    })
    .then(getInnerElementsOfHtml)
    .catch(e => {
      console.log('error fetching product recommendations ', e);
      return null
    });
  }

  function getInnerElementsOfHtml(response: string): HTMLElement[]{
    const html = document.createElement('div');
    html.innerHTML = response;
    const productElems = html.querySelectorAll<HTMLElement>('[data-product-thumbnail');
    return Array.from(productElems);
  }


})()