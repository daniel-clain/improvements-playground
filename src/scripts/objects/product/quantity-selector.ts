/*
 *  Quantity Selector
 *    Define the quantity selector component
 *
 *  Version:
 *    1.0.0 - 2020/11/28
 */

import { html, unsafeHTML, useEffect, useState } from '../../tools/utilities/component';

type QuantitySelectorParams = {
  quantity:number,
  min?:number;
  max?:number;
  disabled?:boolean;
  onChange:(quantity:number)=>void;
};
export const quantitySelectorCreate = (p:QuantitySelectorParams) => {
  let { quantity, min, max, disabled, onChange } = p;

  //Effect to fix a chrome bug yay.
  const [ real, setReal ] = useState(quantity);
  if(real !== quantity) setReal(quantity);
  useEffect(() => setReal(quantity), [ quantity ]);

  //States
  const minusDisabled = disabled || (
    //@ts-ignore
    typeof min === typeof undefined ? false : quantity <= min
  );
  const plusDisabled = disabled || (
    //@ts-ignore
    typeof max === typeof undefined ? false : quantity >= max
  );

  const qtySet = (n:number) => {
    setReal(n);

    //@ts-ignore
    if(typeof min !== typeof undefined) n = Math.max(min, n);
    //@ts-ignore
    if(typeof max !== typeof undefined) n = Math.min(max, n);
    onChange(n);
  }

  //Events
  const plusClick = () => {
    if(plusDisabled) return;
    qtySet(real + 1);
  };

  const minusClick = () => {
    if(minusDisabled) return;
    qtySet(real - 1);
  };

  const inputChange = (e:InputEvent) => {
    const input = e.target as HTMLInputElement;
    qtySet(parseInt(input.value));
  };

  return html`
    <div class="o-quantity-selector__inner has-js">
      <button type="button" ?disabled=${minusDisabled} @click=${minusClick}
        class="o-quantity-selector__button is-minus ${minusDisabled?'is-disabled':''}"
      >
        ${unsafeHTML('<svg class="o-quantity-selector__icon is-minus" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.333 8h9.333"/></svg>')}
      </button>

      <div class="o-quantity-selector__input">
        <input type="number" .value=${real} @change=${inputChange}
          class="o-quantity-selector__input-field o-paragraph ${disabled?'is-disabled':''}"
        />
      </div>

      <button type="button" ?disabled=${plusDisabled} @click=${plusClick}
        class="o-quantity-selector__button is-plus ${plusDisabled?'is-disabled':''}"
      >
        ${unsafeHTML('<svg class="o-quantity-selector__icon is-plus" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3.333v9.334M3.332 8h9.333"/></svg>')}
      </button>
    </div>
  `;
}