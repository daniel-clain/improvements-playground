import { decorateCheckboxFacet, VariantOptionFacet } from '@process-creative/slate-ajax-collection';


export class CustomSizeCheckboxFacet extends decorateCheckboxFacet(VariantOptionFacet){

  getTemplate(title, body) {
    const selectedOptions= this.filter.options.length
    return `
      ${this.params.showTitle === false ? '' : `<span class="c-collection-faceted-nav__title">${title}${selectedOptions ? ` (${selectedOptions})` :''}</span>`}
      ${body}
    `;
  }

  getPrint(e) {
    let options = this.getOptionsToDraw();
    let x = `<ul class="c-collection-faceted-nav__check-group">`;
    options.forEach((option,i) => {
      x += `<li class="c-collection-faceted-nav__check-item">
        <div class="o-checkbox">
          <input
            type="checkbox" class="o-checkbox__checkbox" id="size-checkbox-${this.title}-${i}"
            data-index="${i}" data-option="${this.template.escape(option)}"
            data-facet-checkbox ${this.isSelected(option)?'checked':''}
          />
          <label for="size-checkbox-${this.title}-${i}" class="o-checkbox__label">${this.getOptionName(option)}</label>
        </div>
      </li>`;
    });
    x += `</ul>`
    return x;
  }
}
