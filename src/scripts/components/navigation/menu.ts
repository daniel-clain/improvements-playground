/**
 * Scripts to control menu functionality on the site, mainly used for mobile.
 * 
 */

import { responsiveMediaAbove } from "../../settings/responsive";
import { documentDisableScroll, documentEnableScroll } from "../../tools/layout/document";
import { findTarget } from "../../tools/utilities/event-tools";


const SELECTOR_CONTAINER = '[data-main-menu]';
const SELECTOR_SUBMENU = '[data-menu-submenu]';
const SELECTOR_MENU_TOGGLE = '[data-menu-toggle]';
const SELECTOR_SUBMENU_TOGGLE = '[data-submenu-toggle]';
const SELECTOR_MENU_BACK = '[data-submenu-back]';
const SELECTOR_HEADER = '[data-header]';

const ATTR_SUBMENU = 'data-menu-submenu';

const CLASS_MENU_OPEN = 'is-menu-open';
const CLASS_SUBMENU_OPEN = 'is-submenu-open';
const CLASS_MENU_LEVEL = 'is-menu-level-';


document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach(menuContainer => {

  let menuLevel = 1;

  /*
    Elements
  */
  const headerElement = document.querySelector<HTMLElement>(SELECTOR_HEADER);

  /*
    Event listners
  */
  document.querySelectorAll<HTMLButtonElement>(SELECTOR_MENU_TOGGLE).forEach(element => {
    element.addEventListener('click', (e:Event) => onMenuToggle(e));
  });

  document.querySelectorAll<HTMLAnchorElement>(SELECTOR_SUBMENU_TOGGLE).forEach(element => {
    element.addEventListener('click', (e:Event) => onSubmenuOpen(e));
  });

  document.querySelectorAll<HTMLAnchorElement>(SELECTOR_MENU_BACK).forEach(element => {
    element.addEventListener('click', (e:Event) => onSubmenuBack(e));
  });

  window.addEventListener('resize', () => onResize());


  /*
    Events
  */
  const onMenuToggle = (e:Event) => {
    if(responsiveMediaAbove('MEDIUM')) return;
    e.preventDefault();
    if(menuContainer.classList.contains(CLASS_MENU_OPEN)) return closeMenu();
    openMenu();
  }

  const onSubmenuOpen = (e:Event) => {
    if(responsiveMediaAbove('MEDIUM')) return;
    e.preventDefault();

    //Finding the child submenu of the link clicked on
    const thisTarget = findTarget(e, SELECTOR_SUBMENU_TOGGLE);
    const thisSubmenu = thisTarget?.closest<HTMLElement>(SELECTOR_SUBMENU);
    const newSubmenu = <HTMLElement>thisTarget?.nextElementSibling;
  
    if(!newSubmenu || !thisSubmenu || !newSubmenu.getAttribute(ATTR_SUBMENU)) {
      throw 'Error: Menu structure has changed.';
    }

    updateSubmenuClasses(null, newSubmenu);
  }

  const onSubmenuBack = (e:Event) => {
    e.preventDefault();

    //Element you've clicked on
    const thisTarget = findTarget(e, SELECTOR_MENU_BACK);

    //Finding the submenu one level higher than this one
    const thisSubmenu = thisTarget?.closest(SELECTOR_SUBMENU);
    const parentElement = thisSubmenu?.closest('li');
    const newSubmenu = parentElement?.closest(SELECTOR_SUBMENU);

    if(!thisSubmenu || !newSubmenu) throw 'Error: Menu structure has changed.';

    updateSubmenuClasses(thisSubmenu!, newSubmenu!);
  }

  const onResize = () => {
    if(menuContainer.classList.contains(CLASS_MENU_OPEN) &&
      responsiveMediaAbove('MEDIUM')
    ) return closeMenu();
  }

  //Closing all submenus and hiding the drawer
  const closeMenu = () => {
    menuContainer.classList.remove(CLASS_MENU_OPEN);
    headerElement?.classList.remove(CLASS_MENU_OPEN);
    menuContainer.querySelector<HTMLElement>(SELECTOR_SUBMENU)?.classList.add(CLASS_SUBMENU_OPEN);
    resetSubmenuClasses();
    updateMenuStateClasses(1);
    documentEnableScroll();
  }

  const openMenu = () => {
    menuContainer.classList.add(CLASS_MENU_OPEN);
    headerElement?.classList.add(CLASS_MENU_OPEN);
    documentDisableScroll();
  }

  const resetSubmenuClasses = () => {
    menuContainer.querySelectorAll<HTMLElement>(SELECTOR_SUBMENU).forEach(submenu => {
      submenu.classList.remove(CLASS_SUBMENU_OPEN);
    });
  }

  const updateSubmenuClasses = (thisSubmenu:Element | null, newSubmenu:Element) => {
    const newLevel = newSubmenu.getAttribute(ATTR_SUBMENU);
    if(!newLevel) return;
    thisSubmenu?.classList.remove(CLASS_SUBMENU_OPEN);
    newSubmenu.classList.add(CLASS_SUBMENU_OPEN);
    updateMenuStateClasses(parseInt(newLevel));
  }

  const updateMenuStateClasses = (newLevel:number)  => { 
    menuContainer.classList.remove(`${CLASS_MENU_LEVEL}${menuLevel}`);
    menuContainer.classList.add(`${CLASS_MENU_LEVEL}${newLevel}`);
    menuLevel = newLevel;
  }
});

