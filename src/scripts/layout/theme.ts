import './../base';

//Import Theme Styles
import '../../styles/layout/theme.scss';

//Theme Objects & Components
import '../components/navigation/header';
import '../components/navigation/topbar';
import '../objects/product/quantity-selector';

import '../objects/currency/currency-selector';
import '../objects/shop/shop-money';
import '../objects/search';
import '../objects/store-selector/store-selector';
import '../components/navigation/footer';
import '../components/navigation/menu';


import '../components/cart/cart-drawer';
import '../components/cart/cart-drawer-component';

// TODO: Move this into correct template
import '../templates/customers/account-page';

//Theme Tools
if(process.env.NODE_ENV === 'development') {
  require('../tools/layout/grid-view/grid-view');
}

// Let CSS know JS is available
document.documentElement.classList.remove('js-unavailable');
document.documentElement.classList.add('js-available');
