import { delegate, findTarget } from '../../tools/utilities/event-tools';
import { CLASS_VISIBLE } from '../../tools/constants/classes';


//selectors
const SELECTOR_ADDRESS_CREATE_TOGGLE = '[data-address-create-toggle]';
const SELECTOR_ADDRESS_EDIT_TOGGLE = '[data-address-edit-toggle]';
const SELECTOR_ADDRESS_EDIT_HIDE = '[data-address-edit-hide]';
const SELECTOR_ADDRESS_CREATE_HIDE = '[data-address-create-hide]';
const SELECTOR_ADDRESS_TEMPLATE = '[data-address-create-template]';
const SELECTOR_ADDRESS_EDIT_TEMPLATE = '[data-address-template-edit]';
const SELECTOR_ADDRESS_DELETE = '[data-address-delete]';
const SELECTOR_ADDRESS_FORM_COUNTRY = '[data-address-form-country]';
const ATTR_INDEX = 'data-index';


const createAddressToggle = (e: Event) => {
  const addressCreateTemplate = <HTMLElement>document.querySelector(SELECTOR_ADDRESS_TEMPLATE);
  addressCreateTemplate.classList.toggle(CLASS_VISIBLE);
}

const createAddressHide = (e: Event) => {
  e.preventDefault();
  const addressCreateTemplate = <HTMLElement>document.querySelector(SELECTOR_ADDRESS_TEMPLATE);
  addressCreateTemplate.classList.remove(CLASS_VISIBLE);
}

const deleteAddress = (e: Event) => {
  e.preventDefault();

  if (confirm('Do you want to delete?')) {
    let id = (e.target as Element).getAttribute('data-id');

    //@ts-ignore
    Shopify.postLink(`/account/addresses/${id}`, { parameters: {_method: 'delete'}} );
  }
}

const editAddressToggle = (e: Event) => {
  e.preventDefault();
  let button = findTarget(e, SELECTOR_ADDRESS_EDIT_TOGGLE);
  if(!button) return;

  let editFormIndex = button.getAttribute(ATTR_INDEX);
  const addressEditTemplate = <HTMLElement>document.querySelector(`${SELECTOR_ADDRESS_EDIT_TEMPLATE}[${ATTR_INDEX}="${editFormIndex}"]`);
  addressEditTemplate.classList.toggle(CLASS_VISIBLE);
}

const editAddressHide = (e: Event) => {
  e.preventDefault();
  const addressEditTemplate = <HTMLElement>document.querySelector(SELECTOR_ADDRESS_EDIT_TEMPLATE);
  if(!addressEditTemplate) return;

  addressEditTemplate.classList.remove(CLASS_VISIBLE);
}

const updateProvinceSelector = (countrySelect: HTMLInputElement) => {
  let value = countrySelect.value;
  let optionTag = countrySelect.querySelector(`[value="${value}"]`);
  let provincesData = optionTag ? optionTag.getAttribute('data-provinces') : undefined;
  let provinces = provincesData ? JSON.parse(provincesData) : [];

  let formElement = countrySelect.closest('[data-address-form]');
  if(!formElement) return;

  let provinceElement = formElement.querySelector<HTMLElement>('[data-address-form-province]');
  if(!provinceElement) return;

  provinceElement.innerHTML = provinces.reduce((options: any, province: any) => {
    let [ value, name ] = province;
    return `${options}<option value="${value}">${name}</option>`;
  }, '');
}

const onCountryChange = (e: Event) => {
  e.preventDefault();
  let countrySelect = e.target as HTMLInputElement;
  updateProvinceSelector(countrySelect);
}


(() => {
  let countrySelectElements = document.querySelectorAll(SELECTOR_ADDRESS_FORM_COUNTRY);
  countrySelectElements.forEach(cs => {
    cs.addEventListener('change', onCountryChange);
    updateProvinceSelector(cs as HTMLInputElement);
  });
})();


delegate({
  element: document.documentElement,
  selector: SELECTOR_ADDRESS_EDIT_TOGGLE,
  event: 'click',
  callback: editAddressToggle
});

delegate({
  element: document.documentElement,
  selector: SELECTOR_ADDRESS_EDIT_HIDE,
  event: 'click',
  callback: editAddressHide
});

delegate({
  element: document.documentElement,
  selector: SELECTOR_ADDRESS_CREATE_TOGGLE,
  event: 'click',
  callback: createAddressToggle
});

delegate({
  element: document.documentElement,
  selector: SELECTOR_ADDRESS_CREATE_HIDE,
  event: 'click',
  callback: createAddressHide
});

delegate({
  element: document.documentElement,
  selector: SELECTOR_ADDRESS_DELETE,
  event: 'click',
  callback: deleteAddress
});
