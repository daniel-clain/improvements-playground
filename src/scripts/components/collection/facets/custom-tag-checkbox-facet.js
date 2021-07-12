import { SmartTagCheckboxFacet } from '@process-creative/slate-ajax-collection';

export class CustomTagCheckboxFacet extends SmartTagCheckboxFacet {

  getTemplate(title, body) {
    const selectedOptions = this.filter.tags.length
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
          <input id="tag-checkbox-${this.title}-${i}"
            type="checkbox" class="o-checkbox__checkbox"
            data-index="${i}" data-option="${this.template.escape(option)}"
            data-facet-checkbox ${this.isSelected(option)?'checked':''}
          />
          <label for="tag-checkbox-${this.title}-${i}" class="o-checkbox__label"> ${this.getOptionName(option).toLowerCase()}</label>
        </div>
      </li>`;
    });
    x += `</ul>`
    return x;
  }
}
