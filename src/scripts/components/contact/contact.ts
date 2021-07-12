import { CLASS_VISIBLE, CLASS_HAS_ERROR } from './../../tools/constants/classes';
import { responsiveMediaAbove, RESPONSIVE_SIZES } from './../../settings/responsive';

//Attributes
const PLACEHOLDER_DESKTOP = 'data-desktop-placeholder';
const PLACEHOLDER_MOBILE = 'data-mobile-placeholder';

//Selectors
const CONTACT_CONTAINER = '[data-contact]';
const CONTACT_INPUT = '[data-contact-input]';
const CONTACT_SELECT = '[data-contact-select]';
const OPTIONAL_WRAPPER = '[data-contact-optional]';
const OPTIONAL_INPUT = '[data-contact-optional-input]';
const OPTIONAL_TAG = '[data-contact-optional-tag]';

const contactContainer = document.querySelectorAll<HTMLElement>(CONTACT_CONTAINER);

contactContainer.forEach(contact => {
  const select = contact.querySelector<HTMLInputElement>(CONTACT_SELECT);
  const contactInputs = contact.querySelectorAll<HTMLInputElement>(CONTACT_INPUT);
  const optionalFields = contact.querySelectorAll<HTMLElement>(OPTIONAL_WRAPPER);

  // Remove default Shopify empty country option
  if (!select) return;
  select.querySelector('[value="---"]')?.remove();

  // Hide optional tag once user starts typing in that field
  if (!optionalFields) return;
  optionalFields.forEach(field => {
    const optionalInput = field.querySelector<HTMLInputElement>(OPTIONAL_INPUT);
    const optionalTag = field.querySelector<HTMLElement>(OPTIONAL_TAG);

    if (!optionalInput || !optionalTag) return;
    optionalInput.addEventListener('input', () => {
      hideTag(optionalInput, optionalTag);
    });
  });

  if (!contactInputs) return;
  contactInputs.forEach(input => {
    const desktopPlaceholder = input.getAttribute(PLACEHOLDER_DESKTOP);
    const mobilePlaceholder = input.getAttribute(PLACEHOLDER_MOBILE);

    // Remove has-error class on focus of input
    input.addEventListener('focus', () => {
      input.classList.remove(CLASS_HAS_ERROR);
    });

    // Swaps the placeholder with a longer string on desktop/shorter string on mobile
    // on any input with data-desktop-placeholder & data-mobile-placeholder
    if (!desktopPlaceholder || !mobilePlaceholder) return;

    window.addEventListener('load', () => {
      if (responsiveMediaAbove("MEDIUM")) {
        replacePlaceholderText(input, desktopPlaceholder);
      } else {
        replacePlaceholderText(input, mobilePlaceholder);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= RESPONSIVE_SIZES["MEDIUM"]) {
        replacePlaceholderText(input, desktopPlaceholder);
      } else {
        replacePlaceholderText(input, mobilePlaceholder);
      }
    });
  });
});

/**
 * Hides the optional input tag with the use of a class 
 * @param optionalInput (HTMLInputElement) the input field with the optional tag
 * @param optionalTag (HTMLElement) the optional tag element that is hidden when 
 *                    the input field has something typed in and reappear if input
 *                    is empty
 */

 const hideTag = (optionalInput: HTMLInputElement, optionalTag: HTMLElement) => {
  optionalTag.classList.remove(CLASS_VISIBLE);

  if (optionalInput.value === '') {
    optionalTag.classList.add(CLASS_VISIBLE);
  }
}

/**
 * Replaces the placeholder text inside an input
 * @param input (HTMLInputElement) Input where the placeholder is swapped
 * @param str (string) placeholder string to swap in
 */

 const replacePlaceholderText = (input: HTMLInputElement, str: string) => {
  input.placeholder = str;
}
