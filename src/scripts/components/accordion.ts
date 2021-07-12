/*
 *  Accordion
 *    Script for controlling accordions.
 *
 *  Version:
 *    1.0.0 - 2021/02/08
 */

import { CLASS_INITIALISED } from '../tools/constants/classes';
import { medium, easeOut } from '../settings/animation';
import { findTarget } from '../tools/utilities/event-tools';
import { responsiveMediaAbove, ResponsiveOptions } from '../settings/responsive';

const SELECTOR_ACCORDION = '[data-accordion-container]'
const SELECTOR_SLIDE = '[data-accordion-slide]';
const SELECTOR_SUMMARY = '[data-accordion-title]';
const SELECTOR_CONTENT = '[data-accordion-content]';
const SELECTOR_ICON_PLUS = '[data-icon-plus]';
const SELECTOR_ICON_MINUS = '[data-icon-minus]';


let accordionSlides:NodeListOf<HTMLDetailsElement>|null = null;
let closingOpenSlides = false;

const onClick = (
  e:Event, container:HTMLDetailsElement, isClosing:boolean, isExpanding:boolean,
  animation:Animation|null, disableSize?:ResponsiveOptions
) => {
  e.preventDefault();

  // If a size has been provided, we'll stop the accordion from running above that size
  if(disableSize && responsiveMediaAbove(disableSize)) return;

  // Add an overflow on the container to avoid content overflowing
  container.style.overflow = 'hidden';

  // Check if the element is being closed or is already closed
  if(isClosing || !container.open) {
    open(container, isExpanding, animation, isClosing);

    // Check if the element is being opened or is already open
  } else if(isExpanding || container.open) {
    shrink(container, isExpanding, animation, isClosing);
  }

  // Close the other slides, excluding this one
  const self = findTarget(e, SELECTOR_SLIDE) as HTMLDetailsElement;
  closeOpenSlides(self);
}

const open = (
  container:HTMLDetailsElement, isExpanding:boolean, animation:Animation|null,
  isClosing:boolean
) => {
  // Apply a fixed height on the element
  container.style.height = `${container.offsetHeight}px`;

  // Force the [open] attribute on the details element
  container.open = true;

  // Wait for the next frame to call the expand function
  window.requestAnimationFrame(() => expand(container, isExpanding, animation, isClosing));
}

const expand = (container:HTMLDetailsElement, isExpanding:boolean, animation:Animation|null, isClosing:boolean) => {
  const summary = container.querySelector<HTMLElement>(SELECTOR_SUMMARY);
  if(!summary) return;

  const content = container.querySelector<HTMLElement>(SELECTOR_CONTENT);
  if(!content) return;

  changeIcons(container, true);

  // Set the element as "being expanding"
  isExpanding = true;

  // Store the current fixed height of the container
  const startHeight = `${container.offsetHeight}px`;

  // Calculate the height of the summary
  const endHeight = `${summary.offsetHeight + content.offsetHeight}px`;

  // If there is already an animation running
  if(animation) {
    // Cancel the current animation
    animation.cancel();
  }

  // Start a WAAPI animation
  // - https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
  animation = container.animate({
    // Set the keyframes from the startHeight to endHeight
    height: [startHeight, endHeight]
  }, {
    duration: medium,
    easing: easeOut
  });

  animation.onfinish = () => onAnimationFinish(container, isExpanding, animation, true, isClosing);
  animation.oncancel = () => isExpanding = false;
}

const onAnimationFinish = (
  container:HTMLDetailsElement, isExpanding:boolean, animation:Animation|null,
  open:boolean, isClosing:boolean
) => {
  // Set open attribute based on parameter
  container.open = open;

  // Clear stored animation
  animation = null;

  // Reset isClosing & isExpanding
  isClosing = false;
  isExpanding = false;

  // Remove the overflow hidden and fixed height
  container.style.height = container.style.overflow = '';
}

const shrink = (
  container:HTMLDetailsElement, isExpanding:boolean, animation:Animation|null,
  isClosing:boolean
) => {
  const summary = container.querySelector<HTMLElement>(SELECTOR_SUMMARY);
  if(!summary) return;

  const content = container.querySelector<HTMLElement>(SELECTOR_CONTENT);
  if(!content) return;

  changeIcons(container, false);

  // Set the element as "being closed"
  isClosing = true;

  // Store the current height of the container
  const startHeight = `${container.offsetHeight}px`;

  // Calculate the height of the summary
  const endHeight = `${summary.offsetHeight}px`;

  // If there is already an animation running
  if(animation) {
    // Cancel the current animation
    animation.cancel();
  }

  // Start a WAAPI animation
  // - https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
  animation = container.animate({
    // Set the keyframes from the startHeight to endHeight
    height: [startHeight, endHeight]
  }, {
    duration: medium,
    easing: easeOut
  });

  animation.onfinish = () => onAnimationFinish(container, isExpanding, animation, false, isClosing);
  animation.oncancel = () => isClosing = false;
}

const closeOpenSlides = (activeSlide:HTMLDetailsElement) => {
  if(!accordionSlides || closingOpenSlides) return;
  closingOpenSlides = true;

  accordionSlides.forEach(slide => {
    if(slide == activeSlide || !slide.open) return;

    const summary = slide.querySelector<HTMLElement>(SELECTOR_SUMMARY);
    if(!summary) return;

    summary.click();
  });

  setTimeout(() => closingOpenSlides = false, 500);
}

// Fix accordion icons being slow to change on close
const changeIcons = (container:HTMLElement, isExpanding:boolean) => {
  const iconPlus = container.querySelector<HTMLElement>(SELECTOR_ICON_PLUS);
  const iconMinus = container.querySelector<HTMLElement>(SELECTOR_ICON_MINUS);

  if (iconMinus) iconMinus.style.display = isExpanding ? 'block' : 'none';
  if (iconPlus) iconPlus.style.display = isExpanding ? 'none' : 'block';
}

export const initAccordion = (container:HTMLElement, disableSize?:ResponsiveOptions) => {
  accordionSlides = container.querySelectorAll(SELECTOR_SLIDE);
  if(!accordionSlides) return;

  if(container.classList.contains(CLASS_INITIALISED)) return;
  container.classList.add(CLASS_INITIALISED);

  accordionSlides.forEach(element => initAccordionSlide(element, disableSize));
}

const initAccordionSlide = (container: HTMLDetailsElement | null, disableSize?:ResponsiveOptions) => {
  if(container === null) {
    console.error('Accordion not found');
    return;
  }


  const summary = container.querySelector<HTMLElement>(SELECTOR_SUMMARY);
  if(!summary) return;

  const content = container.querySelector<HTMLElement>(SELECTOR_CONTENT);
  if(!content) return;

  let animation:Animation|null = null;
  let isClosing = false;
  let isExpanding = false;

  summary.addEventListener('click', (e) => onClick(e, container, isClosing, isExpanding, animation, disableSize));
}

export const openAccordion = (container:HTMLElement) => {
  accordionSlides = container.querySelectorAll(SELECTOR_SLIDE);
  if(!accordionSlides) return;

  if(!container.classList.contains(CLASS_INITIALISED)) return;
  container.classList.remove(CLASS_INITIALISED);

  accordionSlides.forEach(element => element.setAttribute('open', 'open'));
}

export const closeAccordion = (container:HTMLElement) => {
  accordionSlides = container.querySelectorAll(SELECTOR_SLIDE);
  if(!accordionSlides) return;

  if(container.classList.contains(CLASS_INITIALISED)) return;
  container.classList.add(CLASS_INITIALISED);

  accordionSlides.forEach(element => element.removeAttribute('open'));
}


const accordionContainer = document.querySelector<HTMLElement>(SELECTOR_ACCORDION);

if(accordionContainer){
  initAccordion(accordionContainer)
}
