import { CLASS_VISIBLE, CLASS_EXPANDED } from '../../tools/constants/classes';
import { RESPONSIVE_SIZES } from '../../settings/responsive';

const SELECTOR_SEARCH_TEMPLATE = '[data-search-template]';
const SELECTOR_EXPAND_TOGGLE = '[data-colour-expand-toggle]';
const SELECTOR_COLOUR_CONTAINER = '[data-colour-container]';
const SELECTOR_THUMBNAIL = '[data-product-thumbnail]';
const SELECTOR_SWATCH_BUTTON = '[data-colour-swatch-button]';

document.querySelectorAll<HTMLElement>(SELECTOR_SEARCH_TEMPLATE).forEach(container => {
  const handleExcessColorSwatches = () => {
    const smallWidth = RESPONSIVE_SIZES.SMALL;

    const allExpandArrows = container.querySelectorAll(SELECTOR_EXPAND_TOGGLE);
    allExpandArrows.forEach((arrow, i) => {
      arrow.addEventListener('click', onExpandClicked);
    });

    setLayout();
    window.addEventListener('resize', setLayout);

    function setLayout() {
      const colourBtnWidth = window.innerWidth < smallWidth ? 30 : 40;
      const thumbnailWidth = getThumbnailWidth() || 0;
      const allThumbnails = getAllThumbnails();

      allThumbnails.forEach((thumbnail, i) => {
        const colorSwatchesCount = thumbnail.querySelectorAll(SELECTOR_SWATCH_BUTTON).length;
        const expandToggleElem = thumbnail.querySelector(SELECTOR_EXPAND_TOGGLE);
        const swatchesWidth = colorSwatchesCount * colourBtnWidth;

        if (swatchesWidth > thumbnailWidth) {
          expandToggleElem?.classList.add(CLASS_VISIBLE);
        } else {
          expandToggleElem?.classList.remove(CLASS_VISIBLE);
        }
      });
    }

    function onExpandClicked(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      const parentColourContainer = (e.target as HTMLElement).closest(SELECTOR_COLOUR_CONTAINER);
      parentColourContainer?.classList.toggle(CLASS_EXPANDED);
    }

    function getThumbnailWidth() {
      return container.querySelector(SELECTOR_THUMBNAIL)?.clientWidth;
    }

    function getAllThumbnails() {
      return container.querySelectorAll(SELECTOR_THUMBNAIL);
    }
  }

  handleExcessColorSwatches();
});
