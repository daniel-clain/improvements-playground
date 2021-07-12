import { Sorter } from '@process-creative/ajax-collection-v3';
import * as SortMethods from '@process-creative/ajax-collection-v3/dist/sort/methods/index';
import { t } from '@process-creative/pc-slate-tools';

const SELECTOR_SORT_INNER = '[data-collection-template-sort]';
const SELECTOR_SORT_VALUE_NAME = '[data-collection-template-sort-value-name]';
const ATTR_SORT_VALUE = 'data-collection-template-sort-value';

export class CustomSortDropdown extends Sorter {
  constructor(template, sortElement) {
    super(template);
    this.sortElement = sortElement;
    this.sortInner = sortElement.find(SELECTOR_SORT_INNER);
    this.sortValue = sortElement.find(SELECTOR_SORT_VALUE_NAME);

    sortElement.on('click touchend', `[${ATTR_SORT_VALUE}]`, e => this.onChange(e));
  }

  onChange(e) {
    let element = $(e.currentTarget);
    this.template.sort.setSort(element.attr(ATTR_SORT_VALUE));
  }

  onUpdate(selected) {

    let x = `<ul class="c-collection-faceted-nav__sort-group">`;
    x += Object.entries(SortMethods).map(([key,value]) => {
      //Skip invalid elements
      if(!value || !value.isVisible) return '';
      if(!value.isVisible(this.template)) return '';

      //Is checked?
      let checked = selected === value;

      //Generate print.
      return `
        <li 
          class="c-collection-faceted-nav__sort-item ${checked?'is-selected':''}"
          ${ATTR_SORT_VALUE}="${value.handle}"
        >
          ${this.getOptionName(value, checked)}
        </li>
      `;
    }).join('');
    x += `</ul>`
    this.sortInner.html(x);
    this.sortValue.html(selected.name);
  }
}


//      <option value="${value.handle}" ${checked?'selected':''}>${this.getOptionName(value, checked)}</option>
