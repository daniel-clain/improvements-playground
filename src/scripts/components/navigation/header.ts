/**
 * Scripts used by the header component.
 * 
 */

//@ts-ignore
import $ from 'jquery';

import { openModal } from "../modal";
import { responsiveMediaAbove } from '../../settings/responsive';
import { getCurrentCart, ON_CART_FINISHED } from "@process-creative/slate-theme-tools";
import { CLASS_VISIBLE, CLASS_STICKY } from "../../tools/constants/classes";

const SELECTOR_CONTAINER = '[data-header]';
const SELECTOR_MENU = '[data-main-menu]';
const SELECTOR_REGION_BTN = '[data-region-toggle]';
const SELECTOR_CART_COUNT = '[data-header-cart-counter]';

const CLASS_HOVER = 'is-menu-hover';

document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach(headerContainer => {

  let lastPosition = document.documentElement.scrollTop;

  /*
    Elements
  */
  const regionSelectorButton = headerContainer.querySelectorAll<HTMLButtonElement>(SELECTOR_REGION_BTN);
  const navigation = headerContainer.querySelector<HTMLElement>(SELECTOR_MENU);

  navigation?.addEventListener('mouseover', () => onMouseOver());
  navigation?.addEventListener('mouseleave', () => onMouseLeave());

  /*
    Events
  */
  const onMouseOver = () => {
    if(responsiveMediaAbove('MEDIUM')) {
      headerContainer.classList.add(CLASS_HOVER);
    }
  }

  const onMouseLeave = () => {
    if(responsiveMediaAbove('MEDIUM')) {
      headerContainer.classList.remove(CLASS_HOVER);
    }
  }

  const onCartUpdate = () => {
    const countElement = document.querySelector<HTMLElement>(SELECTOR_CART_COUNT);
    if(!countElement) return;

    const count = getCurrentCart()['item_count'] || 0;
    countElement.innerHTML = count;
  }

  const checkHeaderPosition = () => {
    const top = document.documentElement.scrollTop;

    if(top != lastPosition) {
      if(top > 0) {
        headerContainer.classList.add(CLASS_STICKY);
      } else {
        headerContainer.classList.remove(CLASS_STICKY);
      }

      lastPosition = top;
    }

    requestAnimationFrame(() => checkHeaderPosition());
  }
  checkHeaderPosition();

  if(regionSelectorButton) {
    regionSelectorButton.forEach(button => button.addEventListener('click', () => showRegionModal()));
    const showRegionModal = () => {
      openModal({modalContentName: 'regionSelector'});
    }
  }

  $(document).on(ON_CART_FINISHED, (e:Event) => onCartUpdate());
});
