import { html } from "../../tools/utilities/component";
import { formatMoney, getFormat, t } from '@process-creative/slate-theme-tools';

export const shippingProgressBarCreate = (minSpendAttr: string | null, subtotal: number) => {
  if (!minSpendAttr) return '';

  const minSpend = parseInt(minSpendAttr);
  if (minSpend == 0) return '';

  // Spend progress
  let spendProgress = subtotal < minSpend ? (subtotal / minSpend) * 100 : 100;
  let remaining = subtotal < minSpend ? minSpend - subtotal : 0;
  let shippingLabel = t('cart.free_shipping_unlocked');

  if (remaining > 0) {
    shippingLabel = t('cart.free_shipping_remaining', {
      remaining: formatMoney(remaining,
        getFormat('', 'money_format')).replace('.00', '')
    });
  }

  return html`
    <div class="c-shipping-progress">
      <p class="c-shipping-progress__label">
        ${shippingLabel}
      </p>

      <div class="c-shipping-progress__progress">
        <span class="c-shipping-progress__progress-bar"></span>
        <span
          class="c-shipping-progress__progress-fill ${spendProgress >= 100 ? 'is-full' : ''}"
          style="width: ${spendProgress}%"
        ><span>
      </div>
    </div>
  `;
}
