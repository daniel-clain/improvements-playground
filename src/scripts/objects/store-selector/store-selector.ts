/*
 *  Store Selector
 *    Scripts for the Store Selector.
 *
 *
 *  Version:
 *    1.0.0 - 2021/05/19
 */

export const CONTAINER_SELECTOR = '[data-store-selector]';
export const SELECT_SELECTOR = '[data-store-selector-select]';

export const STORE_URL = 'data-store-selector-url';

document.querySelectorAll<HTMLElement>(CONTAINER_SELECTOR).forEach((container) => {
  const storeSelector = <HTMLSelectElement>container.querySelector(SELECT_SELECTOR);
  
  if (!storeSelector) return; 

  const onStoreChange = () => {
    if (!storeSelector) return;
    let url = storeSelector.selectedOptions[0]?.value;
    if (url) window.top.location.href = url;
  }

  container.addEventListener('change', onStoreChange);
});