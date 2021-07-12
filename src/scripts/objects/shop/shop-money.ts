import { html, component } from '../../tools/utilities/component';
import { printMoney, t } from '@process-creative/slate-theme-tools';
import * as Language from '../../tools/constants/language';

export type ShopMoneyElement = ReturnType<typeof ShopMoney.create>;
const ShopMoney = component({
  name: 'shop-money',
  attributes: ['money', 'compare', 'moneyclass', 'compareclass', 'currency'],
  render: (params) => {
    const currency = !params.currency;

    const pm = (money?: string | null, clz?: string | null) => {
      if (money && money.length && !isNaN(parseInt(money))) {
        return html`
          <span class="${clz || ''}">
            ${parseInt(money) === 0 
              ? t(Language.PRODUCT_FREE)
              : String(printMoney(parseInt(money),
                  currency
                    ? 'money_format_with_currency'
                    : 'money_format'
                )).replace('.00', '')}
          </span>
        `
      } else { 
        return null;
      }
    }

    return html`
      ${pm(params.compare, params.compareclass)}
      ${pm(params.money, params.moneyclass)}
    `;
  }
});
