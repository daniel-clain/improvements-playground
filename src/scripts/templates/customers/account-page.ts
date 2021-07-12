
import { delegate } from './../../tools/utilities/event-tools';
import { CLASS_VISIBLE } from './../../tools/constants/classes';


// Selectors
const SELECTOR_RESET_PASSWORD_TOGGLE = '[data-reset-password-toggle]';
const SELECTOR_RESET_PASSWORD_HIDE = '[data-reset-password-hide]';
const SELECTOR_RESET_PASSWORD_FORM = '[data-reset-password-form]';
const SELECTOR_LOGIN_FORM = '[data-login-form]';
const SELECTOR_REGISTER_BUTTON = '[data-register-submit]';
const SELECTOR_PASSWORD_INPUT = '[data-password]';
const SELECTOR_PASSWORD_CONFIRM_INPUT = '[data-password-confirm]';
const SELECTOR_REGISTER_FORM_PASSWORD_ERROR = '[data-register-password-error]';

// Classes
const CLASS_PASSWORD_ERROR = 'has-password-error';


const resetPasswordShow = (e?: Event) => {
  if (e) e.preventDefault();
  const resetPasswordForm = <HTMLElement>document.querySelector(SELECTOR_RESET_PASSWORD_FORM);
  const loginForm = <HTMLElement>document.querySelector(SELECTOR_LOGIN_FORM);
  loginForm.classList.remove(CLASS_VISIBLE);
  if (!resetPasswordForm.classList.contains(CLASS_VISIBLE)) {
    resetPasswordForm.classList.add(CLASS_VISIBLE);
  }
}

const resetPasswordToggle = (e?: Event) => {
  if (e) e.preventDefault();
  const resetPasswordForm = <HTMLElement>document.querySelector(SELECTOR_RESET_PASSWORD_FORM);
  const loginForm = <HTMLElement>document.querySelector(SELECTOR_LOGIN_FORM);
  if (resetPasswordForm.classList.contains(CLASS_VISIBLE)) loginForm.classList.add(CLASS_VISIBLE);
  else loginForm.classList.remove(CLASS_VISIBLE);
  resetPasswordForm.classList.toggle(CLASS_VISIBLE);
}

const resetPasswordHide = (e?: Event) => {
  if (e) e.preventDefault();
  const resetPasswordForm = <HTMLElement>document.querySelector(SELECTOR_RESET_PASSWORD_FORM);
  const loginForm = <HTMLElement>document.querySelector(SELECTOR_LOGIN_FORM);
  resetPasswordForm.classList.remove(CLASS_VISIBLE);
  loginForm.classList.add(CLASS_VISIBLE);
}

const onRegisterFormSubmit = (e?: Event) => {
  let password = (document.querySelector(SELECTOR_PASSWORD_INPUT) as HTMLInputElement).value;
  let passwordConfirm = (document.querySelector(SELECTOR_PASSWORD_CONFIRM_INPUT) as HTMLInputElement).value;
  let registerForm = document.querySelector('form[action$="/account"][method="post"]');
  let passwordErrors = document.querySelector(SELECTOR_REGISTER_FORM_PASSWORD_ERROR);

  // Compare passwords
  if (password !== passwordConfirm) {

    // Do not submit the form
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Display errors
    if (registerForm && !registerForm.classList.contains(CLASS_PASSWORD_ERROR)) {
      registerForm.classList.add(CLASS_PASSWORD_ERROR);
    }
    if (passwordErrors && !passwordErrors.classList.contains(CLASS_VISIBLE)) {
      passwordErrors.classList.add(CLASS_VISIBLE);
    }

    return;
  }

  // Remove errors
  if (registerForm && registerForm.classList.contains(CLASS_PASSWORD_ERROR)) {
    registerForm.classList.remove(CLASS_PASSWORD_ERROR);
  }
  if (passwordErrors && passwordErrors.classList.contains(CLASS_VISIBLE)) {
    passwordErrors.classList.remove(CLASS_VISIBLE);
  }
}


(() => {
  if (location.pathname == '/account/login' &&
    (location.hash == '#recover' || location.hash == '#recovered-password')) {
    resetPasswordShow();


    if (location.hash == '#recovered-password') {
      let resetPasswordFormContainer = <HTMLElement>document.querySelector('[data-reset-password-form-container]');
      let resetPasswordSuccessMessage = <HTMLElement>document.querySelector('[data-reset-password-success-message]');

      // toggle success message visible
      if (!resetPasswordFormContainer.classList.contains('is-hidden')) {
        resetPasswordFormContainer.classList.add('is-hidden');
      }
      if (resetPasswordSuccessMessage.classList.contains('is-hidden')) {
        resetPasswordSuccessMessage.classList.remove('is-hidden');
      }
    }
  }

  // Redirect to homepage after register
  let registerForm = document.querySelector('form[action$="/account"][method="post"]');

  if (registerForm) {
    let redirectInputElement = document.createElement('input')
    redirectInputElement.setAttribute('name', 'return_to');
    redirectInputElement.setAttribute('type', 'hidden');
    redirectInputElement.value = '/account';
    registerForm.appendChild(redirectInputElement);
  }

  let registerSubmitButton = document.querySelector(SELECTOR_REGISTER_BUTTON);
  if (registerSubmitButton) {
    (registerSubmitButton as HTMLButtonElement).onclick = (e: Event) => onRegisterFormSubmit(e);
  }

})();


delegate({
  element: document.documentElement,
  selector: SELECTOR_RESET_PASSWORD_TOGGLE,
  event: 'click',
  callback: resetPasswordToggle
});

delegate({
  element: document.documentElement,
  selector: SELECTOR_RESET_PASSWORD_HIDE,
  event: 'click',
  callback: resetPasswordHide
});
