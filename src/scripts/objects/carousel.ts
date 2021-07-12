import KeenSlider, { TOptionsEvents } from 'keen-slider';
import { CLASS_ACTIVE, CLASS_INITIALISED } from './../tools/constants/classes';
import { eventAdd, eventManagerCreate, eventManagerDispose } from './../tools/event-manager';

export type CarouselOptions = TOptionsEvents & {
  autoplay?:boolean;
  autoplaySpeed?:number;
}

const CAROUSEL_DEFAULTS:CarouselOptions = {
  autoplay: false,
  autoplaySpeed: 3
}

// Selector
const SELECTOR_DOT = '[data-carousel-dot]';
const SELECTOR_THUMBNAIL = '[data-carousel-thumbnail]';
const SELECTOR_PREV = '[data-carousel-previous]';
const SELECTOR_NEXT = '[data-carousel-next]';

const CLASS_PREV = 'is-prev-active';
const CLASS_NEXT = 'is-next-active';

export type initCarouselParams = {
  container:HTMLElement,
  options:CarouselOptions,
  dotsContainer?:HTMLElement|null,
  thumbnailsContainer?:HTMLElement|null,
  navigationContainer?:HTMLElement|null,
  variableWidth?:boolean|null,
  fade?:boolean|null,
  controlsContainer?:HTMLElement|null
}
export const initCarousel = (params:initCarouselParams) => {
  let {
    container, options, dotsContainer, thumbnailsContainer,
    navigationContainer, variableWidth, fade
  } = params;

  options = {...CAROUSEL_DEFAULTS, ...options};

  let slides:HTMLElement[] = [];
  let slider:KeenSlider;
  let manager = eventManagerCreate();

  container.classList.add('keen-slider');
  container.childNodes.forEach(child => {
    if(typeof (child as HTMLElement).classList === typeof undefined) return;
    let element = (child as HTMLElement);
    element.classList.add('keen-slider__slide');
    slides.push(element);
  });

  // Autoplay
  let autoplayTimeout:ReturnType<typeof setTimeout>;
  let autoplayState:boolean;
  const autoplay = (state?:boolean) => {
    let newState = !!state;
    autoplayState = newState;
    if(!state) return clearTimeout(autoplayTimeout);
    autoplayTimeout = setTimeout(() => {
      if(!autoplayState) return;
      autoplay(autoplayState);
      slider.next();
    }, (options.autoplaySpeed||10) * 1000);
  };

  autoplay(options.autoplay);

  container.addEventListener("mouseover", () => {
    autoplay(false);
  });

  container.addEventListener("mouseout", () => {
    autoplay(options.autoplay);
  });

  // Setup dot events
  if(dotsContainer) {
    const dots:NodeListOf<HTMLElement> = dotsContainer.querySelectorAll(SELECTOR_DOT);
    if(!dots) return;
    dots.forEach((dot, idx) => dot.addEventListener('click', () => slider.moveToSlide(idx)));
  }

  // Setup thumbnail events
  if(thumbnailsContainer) {
    const thumbnails:NodeListOf<HTMLElement> = thumbnailsContainer.querySelectorAll(SELECTOR_THUMBNAIL);
    if(!thumbnails) return;
    thumbnails.forEach((thumbnail, idx) => thumbnail.addEventListener('click', () => slider.moveToSlide(idx)));
  }

  // Setup navigation events
  if(navigationContainer) {
    const prev = navigationContainer.querySelector<HTMLElement>(SELECTOR_PREV);
    const next = navigationContainer.querySelector<HTMLElement>(SELECTOR_NEXT);

    if(!prev || !next) return;

    next.addEventListener('click', () => slider.next());
    prev.addEventListener('click', () => slider.prev());
  }

  // Setup controls (arrows)
  if(params.controlsContainer) {
    const prev = params.controlsContainer.querySelector<HTMLElement>(SELECTOR_PREV);
    const next = params.controlsContainer.querySelector<HTMLElement>(SELECTOR_NEXT);
    const dots:NodeListOf<HTMLElement> = params.controlsContainer.querySelectorAll(SELECTOR_DOT);
  
    if(prev) {
      eventAdd(manager, {
        element: prev,
        method: "click",
        callback: () => slider.prev()
      });
    }

    if(next) {
      eventAdd(manager, {
        element: next,
        method: "click",
        callback: () => slider.next()
      });
    }
  }

  // Update active class
  const updateClasses = (slider:KeenSlider) => {
    const slideIdx = slider.details().relativeSlide;
    if(isNaN(slideIdx)) return;

    const numSlides = slider.details().size;
    const slide = slides[slideIdx];

    let nextIndex = slideIdx + 1;
    let prevIndex = slideIdx - 1;

    if(nextIndex >= numSlides) nextIndex = 0;

    if(prevIndex < 0) prevIndex = numSlides - 1;

    let slideNext = slides[nextIndex];
    let slidePrev = slides[prevIndex];

    // Manage slide classes
    slides.forEach(s => s.classList.remove(CLASS_ACTIVE, CLASS_NEXT, CLASS_PREV));

    slide.classList.add(CLASS_ACTIVE);
    slideNext.classList.add(CLASS_NEXT);
    slidePrev.classList.add(CLASS_PREV);

    // Manage dot classes
    if(dotsContainer) {
      dotsContainer.classList.add(CLASS_INITIALISED);
      const dots:NodeListOf<HTMLElement> = dotsContainer.querySelectorAll(SELECTOR_DOT);
      dots.forEach((dot, idx) => {
        idx === slideIdx ? dot.classList.add(CLASS_ACTIVE): dot.classList.remove(CLASS_ACTIVE);
      });
    }

    // Manage thumbnail classes
    if(thumbnailsContainer) {
      thumbnailsContainer.classList.add(CLASS_INITIALISED);
      const thumbnails:NodeListOf<HTMLElement> = thumbnailsContainer.querySelectorAll(SELECTOR_THUMBNAIL);
      thumbnails.forEach((thumbnail, idx) => {
        idx === slideIdx ? thumbnail.classList.add(CLASS_ACTIVE): thumbnail.classList.remove(CLASS_ACTIVE);
      });
    }
  }

  // On destroyed callback
  const onDestroyed = () => {
    container.classList.remove(CLASS_INITIALISED);
    slides.forEach(slide => {
      slide.classList.remove(CLASS_ACTIVE, CLASS_NEXT, CLASS_PREV);
      slide.removeAttribute('style');
    });

    if(thumbnailsContainer) thumbnailsContainer.classList.remove(CLASS_INITIALISED);
    if(dotsContainer) dotsContainer.classList.remove(CLASS_INITIALISED);
  }

  // On mounted
  const onMounted = (slider:KeenSlider) => {
    container.classList.add(CLASS_INITIALISED);
    updateClasses(slider);
  }

  // On slide changed
  const onSlideChanged = (slider:KeenSlider) => {
    // Update classes
    updateClasses(slider);
  }

  // Allows for slide movement based on variable width slides
  const variableWidthMovement = (slider:KeenSlider) => {
    if(!variableWidth) return;

    const details = slider.details();
    const slidePercent = details.size * details.progressTrack;

    let offsetWidth = 0;
    let totalSlideWidth = 0;
    for(let i = 0; i < slides.length; i++) {
      const slideWidth = slides[i].getBoundingClientRect().width;
      totalSlideWidth += slideWidth;

      let next = i + 1;

      if(slidePercent >= next) {
        offsetWidth += slideWidth;
      } else if(slidePercent > i && slidePercent < next) {
        offsetWidth += slideWidth * (slidePercent - i);
      }
    }

    /**
     * If the slide tracks progress is more then halfway through, grab the 1st
     * quarter of slides and throw them back to the end of the que
     */
    for(let i = 0; i < slides.length; i++) {
      let slideOffset = -offsetWidth;
      let loopAround = i < Math.floor(slidePercent);
      if(loopAround) slideOffset += totalSlideWidth;
      slides[i].style['transform'] = `translate3d(${slideOffset.toFixed(2)}px, 0, 0)`;
    }
  }

  // Fades slides instead of transforming them
  const fadeMovement = (slider:KeenSlider) => {
    const opacities = slider.details().positions.map((slide) => slide.portion);
    slides.forEach((element, idx) => {
      element.style.opacity = `${opacities[idx]}`;
      element.style.transform = `translateX(-${idx*100}%)`;
    });
  }

  // On slide moved
  const onSlideMoved = (slider:KeenSlider) => {
    if(variableWidth) variableWidthMovement(slider);
    if(fade) fadeMovement(slider);
  }

  // Slider Init
  slider = new KeenSlider(container, {
    dragStart: () => autoplay(false),
    dragEnd: () => autoplay(options.autoplay),
    slideChanged: (slider) => onSlideChanged(slider),
    mounted: (slider) => onMounted(slider),
    destroyed: () => onDestroyed(),
    move: (slider) => onSlideMoved(slider),
    ...options
  });

  return { slider, autoplay, slides }
}