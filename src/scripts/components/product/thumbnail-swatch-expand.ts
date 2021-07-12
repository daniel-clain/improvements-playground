
import {SMALL} from '../../settings/responsive';
//@ts-ignore
import $ from 'jquery';
const SELECTOR_THUMBNAIL = '[data-product-thumbnail]';
const SELECTOR_EXPAND_TOGGLE = '[data-colour-expand-toggle]';
const SELECTOR_COLOUR_CONTAINER = '[data-colour-container]';

const CLASS_VISIBLE = 'is-visible';
const CLASS_EXPANDED = 'is-expanded';

export function handleExcessColorSwatches(container: HTMLElement){

  const allExpandArrows = $(container).find(SELECTOR_EXPAND_TOGGLE);
  allExpandArrows.on('click', onExpandClicked);
  setLayout();
  $(window).on('resize', setLayout);


  function setLayout(){
    const colourBtnWidth = window.innerWidth < SMALL ? 30 : 40;
    const thumbnailWidth = getThumbnailWidth();
    const allThumbnails = getAllThumbnails();

    thumbnailWidth && allThumbnails.forEach((thumbnail,i) => {
      const colorSwatchesCount = $(thumbnail).find('[data-colour-swatch-button]').length;
      const expandToggleElem = $(thumbnail).find(SELECTOR_EXPAND_TOGGLE);

      const swatchesWidth = colorSwatchesCount * colourBtnWidth;

      if(swatchesWidth > thumbnailWidth){
        expandToggleElem.addClass(CLASS_VISIBLE);
        if(i == 2){
          console.log('expand visible');
        }

      }
      else{
        expandToggleElem.removeClass(CLASS_VISIBLE);
        if(i == 2){
          console.log('expand hidden');
        }
      }
    })
     


  }

  function onExpandClicked(e: any){
    e.preventDefault();
    e.stopPropagation();
    const parentColourContainer = e.target.closest(SELECTOR_COLOUR_CONTAINER);

    $(parentColourContainer).toggleClass(CLASS_EXPANDED);
  }


  function getThumbnailWidth(){
    return container.querySelector(SELECTOR_THUMBNAIL)?.clientWidth;
  }
  function getAllThumbnails(){
    return Array.from($(container).find(SELECTOR_THUMBNAIL));
  }

}