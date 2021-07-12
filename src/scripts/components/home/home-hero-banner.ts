
import { initCarousel, CarouselOptions } from '../../objects/carousel';

const SELECTOR_CONTAINER = '[data-home-hero]';
const SELECTOR_CAROUSEL = '[data-carousel]';
const SELECTOR_CONTROLS = '[data-carousel-controls]';

const options:CarouselOptions = {
  loop: true
}

document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach(containerElement => {
  const carouselElement = containerElement.querySelector<HTMLDivElement>(SELECTOR_CAROUSEL);
  const controls = containerElement.querySelector<HTMLDivElement>(SELECTOR_CONTROLS);
  if(!carouselElement) return;

  const carouselInitialised = initCarousel({
    container: carouselElement,
    dotsContainer: controls,
    options
  });
});