
import { MEDIUM } from '../../settings/responsive';
import { initAccordion, closeAccordion, openAccordion } from './../accordion';

const SELECTOR_ACCORDION = '[data-footer-accordion]';

document.querySelectorAll<HTMLElement>(SELECTOR_ACCORDION).forEach(containerElement => {
  if (containerElement) {
    initAccordion(containerElement, "MEDIUM");
    closeAccordion(containerElement);
  }

  // But we'll open or close the accordions based on the size
  if(window.innerWidth < MEDIUM) {
    closeAccordion(containerElement);
  } else {
    openAccordion(containerElement);
  }

  // Open/close accordion based on window size
  window.addEventListener('resize', () => {
    if(window.innerWidth < MEDIUM) {
      closeAccordion(containerElement);
    } else {
      openAccordion(containerElement);
    }
  });
});