import { initCarousel } from '../../objects/carousel';
import { CLASS_ACTIVE } from '../../tools/constants/classes';

const SELECTOR_CONTAINER = '[data-topbar]';
const SELECTOR_CAROUSEL = '[data-carousel]';
const SELECTOR_CONTROLS = '[data-carousel-controls]';

document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach(topbar => {
  const carousel = topbar.querySelector<HTMLDivElement>(SELECTOR_CAROUSEL);
  const controls = topbar.querySelector<HTMLDivElement>(SELECTOR_CONTROLS);
  if(!carousel) return;

  const speed = topbar.getAttribute('data-autoplay-speed');

  const settings = {
    autoplay: topbar.getAttribute('data-autoplay') == 'true' ? true : false,
    autoplaySpeed: speed ? parseInt(speed) : 3
  };

  const params = {
    container: carousel,
    options: {
      ...settings,
      loop: true
    }, controlsContainer: controls
  }

  const slider = initCarousel(params);

  topbar.classList.add(CLASS_ACTIVE);
});