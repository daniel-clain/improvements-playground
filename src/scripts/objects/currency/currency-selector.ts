/*
 *  Store Selector
 *    Scripts for the Shopify Plus currency selector.
 *
 *
 *  Version:
 *    1.0.0 - 2021/06/16
 */
export {};
const SELECTOR_CONTAINER = '[data-currency-selector]';

document.querySelectorAll<HTMLSelectElement>(SELECTOR_CONTAINER).forEach((currencySelector) => {
  const form = currencySelector.closest('form');
  if(!form) return;
  currencySelector.addEventListener('change', () => form.submit());
});