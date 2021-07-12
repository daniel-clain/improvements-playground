import { ajaxRequest } from "@process-creative/slate-theme-tools";
import { closeModal, onModalOpen } from "../modal";
const ATTR_FALLBACK_PAGE = 'data-bis-fallback-page'
const CLASS_SUBMITTED = 'is-submitted'
const CLASS_FAILED = 'has-failed'

console.error('Warning! Back in stock module incomplete because requires live store Klaviyo Key');

const fallbackPageHandle = document.querySelector(`[${ATTR_FALLBACK_PAGE}]`)?.getAttribute(ATTR_FALLBACK_PAGE)

const backInStockModal = document.querySelector("[data-modal-content='backInStock']")!
const bisForm = document.querySelector<HTMLFormElement>('[data-bis-form]');

onModalOpen('backInStock', () => {
  setBackInStockModalSubmitted(false)
  setBackInStockModalFailed(false)
})

if(bisForm) {
  bisForm.addEventListener('submit', (e:Event) => {
    e.preventDefault();
    const emailElem = document.querySelector<HTMLInputElement>('[data-bis-email]')!;
    const email: string = emailElem.value;
    const variant: string = document.querySelector<HTMLSelectElement>('[data-variant-selector]')!.value;
    submitBackInStock(variant, email);

    function submitBackInStock(variant: string, email: string){
      const URL = 'https://a.klaviyo.com/onsite/components/back-in-stock/subscribe';
      const KEY = document.querySelector<HTMLElement>('[data-klaviyo-key]')!.getAttribute('data-klaviyo-key');
      if(!KEY) return noBackinstockFallback();
      ajaxRequest(URL, 'POST', {
        a: KEY,
        email: email,
        variant: variant,
        platform: 'shopify'
      })
      .then(setBackInStockModalSubmitted)
      .catch(noBackinstockFallback);
    }
  });
}

function noBackinstockFallback(error?:string){
  setBackInStockModalFailed()
  if(fallbackPageHandle){
    setTimeout(() => {
      window.location.href = `/pages/${fallbackPageHandle}`
    }, 3000);
  }
}
function setBackInStockModalFailed(failed = true){
  if(failed){
    backInStockModal.classList.add(CLASS_FAILED)
  } else {
    backInStockModal.classList.remove(CLASS_FAILED)
  }
}

function setBackInStockModalSubmitted(submitted = true){
  if(submitted){
    backInStockModal.classList.add(CLASS_SUBMITTED)
  } else {
    backInStockModal.classList.remove(CLASS_SUBMITTED)
  }
}