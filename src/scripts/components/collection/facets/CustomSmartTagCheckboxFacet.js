import { SmartTagCheckboxFacet } from '@process-creative/ajax-collection-v3';
import {
  t
} from '@process-creative/pc-slate-tools';
import * as Language from '../../../tools/constants/language';
export class CustomSmartTagCheckboxFacet extends SmartTagCheckboxFacet {
  getTemplate(title, body) {
    let options = this.getOptionsToDraw();
    let numSelected = 0;
    options.forEach((option,i) => {
      if(this.isSelected(option)) {
        numSelected++;
      }
    });
    if(this.params.showTitle === false) {
      return `${body}`;
    } else {
      return `
        <span class="c-collection-faceted-nav__title">
          ${title} 
          ${numSelected > 0 ? `<span class="c-collection-faceted-nav__num-selected">(${numSelected})</span>` : ''}
        </span>
        ${body}
      `;
    }
  }

  getPrint(e) {
    let options = this.getOptionsToDraw();
    let x = `<div class="c-collection-faceted-nav__group-inner">`
    x+= `<div class="c-collection-faceted-nav__group-header">`
    x+= `
      <button
        class="c-collection-faceted-nav__group-back"
        data-collection-template-back-facet
      >
        <span class="u-visually-hidden">back</span>
      </button>
    `
    x+= `${this.title}`
    x+= `
      <button
        class="c-collection-faceted-nav__group-close"
        data-collection-template-toggle-filters
      >
        <span class="u-visually-hidden">close</span>
      </button>
    `
    x += `</div>`
    x += `<ul class="c-collection-faceted-nav__check-group">`;
    options.forEach((option,i) => {
      x += `<li class="c-collection-faceted-nav__check-item">
        <div class="o-checkbox">
          <input
            id="smart-tag-checkbox-${this.title}-${i}"
            type="checkbox" class="o-checkbox__checkbox"
            data-index="${i}" data-option="${this.template.escape(option)}"
            data-facet-checkbox ${this.isSelected(option)?'checked':''}
          />
          <label for="smart-tag-checkbox-${this.title}-${i}" class="o-checkbox__label">${this.getOptionName(option).toLowerCase()}</label>
        </div>
      </li>`;
    });
    x += `
      </ul>
      <button
        class="c-collection-faceted-nav__clear-btn"
        data-collection-template-clear-filters
      >
        ${t(Language.COLLECTION_CLEAR_FILTERS)}
      </button>
    </div>`
    return x;
  }
}
