import KeenSlider from 'keen-slider';

import { CarouselOptions, initCarousel } from './../objects/carousel';
import { responsiveMediaAbove, responsiveMediaBelow, responsiveQuery } from '../settings/responsive';
import { CLASS_ACTIVE, CLASS_INITIALISED } from '../tools/constants/classes';

const SELECTOR_CONTAINER = '[data-feature-blocks]';
const SELECTOR_CAROUSEL = '[data-feature-block-slides]';
const SELECTOR_CONTROLS = '[data-carousel-controls]';

const options:CarouselOptions = {
  loop: true,
  breakpoints: {
    [responsiveQuery('MEDIUM')]: {
      created: (slider:KeenSlider) => slider.destroy()
    }
  }
}

document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach(containerElement => {
  const carouselElement = containerElement.querySelector<HTMLDivElement>(SELECTOR_CAROUSEL);
  const controls = containerElement.querySelector<HTMLDivElement>(SELECTOR_CONTROLS);
  if(!carouselElement) return;

  const carouselInitialised = initCarousel({
    container: carouselElement,
    dotsContainer: controls,
    options: options
  });

  // Destroy and Refresh carousel based on window width
  const onResize = () => {
    if(!carouselInitialised) return;
    const carousel = carouselInitialised.slider;

    if(responsiveMediaAbove('MEDIUM') && carouselElement.classList.contains(CLASS_INITIALISED)) {
      carousel.destroy();
      containerElement.classList.remove(CLASS_ACTIVE);
    } else if(responsiveMediaBelow('MEDIUM') && !carouselElement.classList.contains(CLASS_INITIALISED)) {
      carousel.refresh();
      containerElement.classList.add(CLASS_ACTIVE);
    }
  }

  window.addEventListener('resize', onResize);
});