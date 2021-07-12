/**
 * Scripts used by the search bar component.
 * 
 */

const SELECTOR_CONTAINER = '[data-search-bar]';
const SELECTOR_SEARCH_SUBMIT = '[data-search-submit]';
const SELECTOR_SEARCH_INPUT = '[data-search-input]';

const CLASS_HAS_ERROR = 'has-error';
export {};

document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach(searchContainer => {
  const inputElement = searchContainer.querySelector<HTMLInputElement>(SELECTOR_SEARCH_INPUT);
  const submitElement = searchContainer.querySelector<HTMLButtonElement>(SELECTOR_SEARCH_SUBMIT);
  if(!inputElement || !submitElement) return;

  submitElement.addEventListener('click', e => {
    if(inputElement.value == '') {
      searchContainer.classList.add(CLASS_HAS_ERROR);
      e.preventDefault();
    }

    //We only need to do this after they've been blocked from searching
    inputElement.addEventListener('keyup', () => {
      if(inputElement.value != '') {
        searchContainer.classList.remove(CLASS_HAS_ERROR);
      }
    });
  });
});