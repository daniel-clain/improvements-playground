import { Sorter } from '@process-creative/slate-ajax-collection';
import * as SortMethods from '@process-creative/slate-ajax-collection/dist/sort/methods/index';
const ATTR_SORT_VALUE = 'data-sort-value'
export class CustomSort extends Sorter {
  constructor(template, sortElement) {
    super(template);
    this.sortElement = sortElement
    sortElement.on('click', `[${ATTR_SORT_VALUE}]`, ({target}) => {
      const selectedSortMethod = target.getAttribute(ATTR_SORT_VALUE)
      this.template.sort.setSort(selectedSortMethod)
    })
  }


  onUpdate(selected) {

    let sortHtml = /* html */`
      <span class="c-collection-faceted-nav__title">Sort: ${selected.name}</span>
      <ul class="c-collection-faceted-nav__sort-group">
        ${Object.values(SortMethods).map(sortMethod => {
          //Skip invalid elements
          if(!sortMethod || !sortMethod.isVisible) return '';
          if(!sortMethod.isVisible(this.template)) return '';
    
          //Is checked?
          let checked = selected === sortMethod;
    
          //Generate print.
          return /* html */`
            <li 
              class="c-collection-faceted-nav__sort-item ${checked?'is-selected':''}"
              ${ATTR_SORT_VALUE}="${sortMethod.handle}"
            >
              ${this.getOptionName(sortMethod, checked)}
            </li>
          `;
        }).join('')}
      </ul>
    `;

    this.sortElement.html(sortHtml);
  }
}
