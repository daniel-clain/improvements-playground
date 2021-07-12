
import {component, useState, useEffect} from 'haunted';
import {html} from 'lit-html';
import { Product } from '../tools/product/product';
import { Variant } from '../tools/product/variant';

type ProductTemplateProps = {
  productJson: string
  initialVariantJson: string
}
const ProductTemplate = ({productJson, initialVariantJson}: ProductTemplateProps) => {
  console.log('productJson :>> ', productJson);
  console.log('initialVariantJson :>> ', initialVariantJson);
  const product: Product = JSON.parse(productJson)
  const [activeVariant, setActiveVariant] = useState<Variant>(JSON.parse(initialVariantJson))
  return html`
    <div class="c-product-template">
      <h1>test xyz</h1>
      ${activeVariant.name + product.title}
    </div>
  `
}
const observedAttributes = ['product-json', 'initial-variant-json']
 //@ts-ignore
customElements.define('product-template', component(ProductTemplate, {observedAttributes}));