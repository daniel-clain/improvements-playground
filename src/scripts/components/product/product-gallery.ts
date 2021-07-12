/*
 *  Product Gallery
 *    Scripts for the product gallery
 *
 *  Version:
 *    1.0.0 - 2020/11/19
 */

import KeenSlider from 'keen-slider';
import { initCarousel } from './../../objects/carousel';
import { responsiveMediaAbove, responsiveMediaBelow, responsiveQuery } from '../../settings/responsive';
import { CLASS_HIDDEN, CLASS_INITIALISED } from '../../tools/constants/classes';
import { Product } from '../../tools/product/product';
import { getVariant, onVariantSelected, variantSelectorWatch } from '../../objects/product/variant-selector';
import { swatchesFind } from './product-swatches';
import { handlize } from '@process-creative/slate-theme-tools';
import { Variant } from '../../tools/product/variant';


// Selectors
const SELECTOR_CONTAINER = '[data-product-gallery]';
const SELECTOR_CAROUSEL = '[data-product-gallery-slides]';
const SELECTOR_SLIDE = '[data-product-gallery-slide]';
const SELECTOR_DOTS_CAROUSEL = '[data-carousel-dots]';
const SELECTOR_DOT = '[data-carousel-dot]';
const SELECTOR_NAVIGATION = '[data-carousel-navigation]';
const SELECTOR_TEMPLATE = '[data-product-template]';
const SELECTOR_VARIANT_SELECTOR = '[data-variant-selector]'


// Initialise Carousel
document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach
(container => {

  let currentVariant = getVariant();

  if(responsiveMediaAbove('SMALL')){
    showVariantsImages()
  } else {
    updateCarouselImage(currentVariant)
  }

  const dotsContainer = container.querySelector<HTMLElement>(SELECTOR_DOTS_CAROUSEL);
  const carouselElement = container.querySelector<HTMLElement>(SELECTOR_CAROUSEL);
  const template = document.querySelector<HTMLElement>(SELECTOR_TEMPLATE);



  if(!carouselElement || !dotsContainer || !template) return;

  
  const swatches = swatchesFind({ container: template })!;

  variantSelectorWatch({
    variantSelector: swatches.variantSelector,
    variantChange: ({ variant }) => {
      currentVariant = variant;
      if(responsiveMediaAbove('SMALL')){
        showVariantsImages()
      } else {
        updateCarouselImage(variant)
      }
    }
  })

  const options = {
    slidesPerView: 1,
    loop: true,
    breakpoints: {
      [responsiveQuery('SMALL')]: {
        created: (slider:KeenSlider) => slider.destroy()
      }
    }
  };

  let params = {container: carouselElement, options: options, dotsContainer: dotsContainer};
  const carousel = initCarousel(params);

  
  function updateCarouselImage (variant:Variant) {
    if(!variant.featured_media || !variant.featured_media.id || !carousel || !carousel.slides) return;
    let variantMediaId = variant.featured_media.id;
    for (let i = 0; i < carousel.slides.length; i++) {
      if(carousel.slides[i].dataset.mediaId == variantMediaId) {
        carousel.slider.moveToSlide(i);
      }
    }
  }

  let mediaBelowSmall = responsiveMediaBelow('SMALL');

  const onResize = async () => {
    try{await debounce(100)}
    catch{return}
    
    // if(mediaBelowSmall && responsiveMediaBelow('SMALL') ||
    // !mediaBelowSmall && responsiveMediaAbove('SMALL')) return;

    if(!carousel || !carouselElement) return;
    const slider = carousel.slider;
    

    if(responsiveMediaAbove('SMALL') && carouselElement.classList.contains(CLASS_INITIALISED)) {
      slider.destroy();
    } else if(responsiveMediaBelow('SMALL') && !carouselElement.classList.contains(CLASS_INITIALISED)) {
      slider.refresh();
    }

    if(responsiveMediaBelow('SMALL')){
      updateCarouselImage(currentVariant)
      removeHiddenFromImages()
      mediaBelowSmall = true;
    } else {
      showVariantsImages();
      mediaBelowSmall = false;
    }
  }
  window.addEventListener('resize', onResize);

  let previousDebounceTimeout: any
  let previousDebounceReject: any
  function debounce(ms: number): Promise<void>{
    clearTimeout(previousDebounceTimeout)
    previousDebounceReject?.()
    return new Promise((resolve, reject) => {
      previousDebounceReject = reject
      previousDebounceTimeout = setTimeout(resolve, ms);
    });
  }

});


function removeHiddenFromImages(){
  const allGalleryImages = document.querySelectorAll(SELECTOR_SLIDE)!
  allGalleryImages.forEach(image => {
    image.classList.remove(CLASS_HIDDEN)
  })

}

function showVariantsImages(){
  const variantColour = getVariantColor()
  if(!variantColour) return
  
  const allGalleryImages = document.querySelectorAll(SELECTOR_SLIDE)!

  let noMatches = true
  allGalleryImages.forEach(image => {
    const imageColourLower = handlize(image.getAttribute('data-image-colour')!)
    const variantColourLower = variantColour.toLowerCase()

    if(imageColourLower == variantColourLower){
      noMatches = false
      image.classList.remove(CLASS_HIDDEN)
    }
    else{
      image.classList.add(CLASS_HIDDEN)
    }
  })
  if(noMatches){
    removeHiddenFromImages()
  }
  

  // implementation
  function getVariantColor(){
    const productObj: Product = JSON.parse(document.querySelector(SELECTOR_VARIANT_SELECTOR)!.getAttribute('data-product')!)

    const colourOptionPosition = Object.values(productObj.options_with_values).reduce((x: number | null, option) => {
      if(x) return x
      if(['color', 'colour'].includes(option!.name.toLocaleLowerCase())){
        return option!.position
      }
      else return x
    }, null)


    const selectedOptionElem = document.querySelector<HTMLSelectElement>(SELECTOR_VARIANT_SELECTOR)?.selectedOptions?.[0]

    const variantColour = selectedOptionElem?.getAttribute(`data-option${colourOptionPosition}`)

    return variantColour

  }
}
