const ERROR_LIST = <const>{
  unknown: 'ERROR_UNKNOWN',
  allInCart: 'ERROR_ALL_IN_CART'
};

type ErrorList = (typeof ERROR_LIST);
type ShopifyAjaxErrorLookup<T extends keyof ErrorList> = ErrorList[T];

export const shopifyAjaxErrorGet = (e:any) => {
  let error:(keyof ErrorList) = 'unknown';

  if(e && e.description) {
    if(e.description.startsWith('All') && e.description.endsWith('in your cart.')) {
      error = 'allInCart';
    }
  }

  return ERROR_LIST[error] as ShopifyAjaxErrorLookup<typeof error>;
}