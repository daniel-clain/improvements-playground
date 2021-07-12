import { ColorSwatchFacet } from '@process-creative/slate-ajax-collection';
import { handlize } from '@process-creative/slate-theme-tools';

export class CustomColourFacet extends ColorSwatchFacet{

  getSwatch(opt) {
    if(!opt) return null;
    if(!this.filter.getSwatchByColor) return null;
    return this.filter.getSwatchByColor(opt);
  }

  //Appears incorrect in the ColorSwatchFacet Superclass
  getOptionValue(opt) {
    if(!opt) return null;
    let swatch = this.getSwatch(opt);
    if(swatch && swatch.name) return handlize(swatch.name);
    return handlize(opt);
  }

  //Needed for selectedOptions Count
  getTemplate(title, body) {
    const selectedOptions= this.filter.colors.length
    // const selectedOptions= 2

    return `
      ${this.params.showTitle === false ? '' : `<span class="c-collection-faceted-nav__title">${title}${selectedOptions ? ` (${selectedOptions})` :''}</span>`}
      ${body}
    `;
  }

  getSwatchPrint(o) {
    return `
      <button
        type="button" data-swatch-value="${handlize(o)}"
        title="${o}"
        class="o-swatches__swatch-button ${this.isSelected(o) ? `is-selected` : ``}"
      >
        <div class="o-swatches__swatch-button-inner s-swatch--${handlize(o)}">
        </div>
      </button>
    `;
  }

  getPrint() {
    let options = this.getOptionsToDraw();

    let x = `<div class="c-collection-faceted-nav__swatch-group o-swatch__container is-color">`;
    options.forEach(o => {
      x += this.getSwatchPrint(o);
    });
    x += `</div>`;

    return x;
  }

}