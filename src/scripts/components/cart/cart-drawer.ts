/*
 *  Cart Drawer Scripts
 *    Scripts for the cart drawer
 *
 *  Version:
 *    1.0.0 - 2020/11/28
 */

//@ts-ignore
import $ from 'jquery';

import { delegate } from "../../tools/utilities/event-tools";
import { documentDisableScroll, documentEnableScroll } from "../../tools/layout/document";
import { CLASS_OVERLAY_OPEN, CLASS_IS_CART_OPEN } from './../../tools/constants/classes';
import { ON_CART_FINISHED } from "@process-creative/slate-theme-tools";

// Selectors
const SELECTOR_DRAWER_TOGGLE = '[data-cart-drawer-toggle]';
const SELECTOR_OVERLAY = '[data-body-overlay]';

// Functions
const open = (clazz: string) => {
  // Add body classes
  document.body.classList.add(clazz);
  document.body.classList.add(CLASS_OVERLAY_OPEN);

  // Disable scroll
  documentDisableScroll();
}

const close = (clazz: string) => {
  // Remove body classes
  document.body.classList.remove(clazz);
  document.body.classList.remove(CLASS_OVERLAY_OPEN);

  // Enable scroll
  documentEnableScroll();
}

const drawerToggle = (e: Event) => {
  e.preventDefault(), e.stopPropagation();

  if (document.body.classList.contains('c-page--cart')) return;
  if (document.body.classList.contains(CLASS_IS_CART_OPEN)) return close(CLASS_IS_CART_OPEN);

  open(CLASS_IS_CART_OPEN);
}

/*
  Events
*/

// On cart drawer trigger click
delegate({
  element: document.documentElement,
  selector: SELECTOR_DRAWER_TOGGLE,
  event: 'click',
  callback: drawerToggle
});

// On body overlay click
delegate({
  element: document.documentElement,
  selector: SELECTOR_OVERLAY,
  event: 'click',
  callback: drawerToggle
});

// After add to cart event finishes
$(document).on(ON_CART_FINISHED, (e:Event) => open(CLASS_IS_CART_OPEN));
