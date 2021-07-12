/*
 *  Collection Template
 *    Contains all the scripts used for the collection template.
 *
 *  Version:
 *    1.0.0 - 2020/10/22
 */

import $ from 'jquery';
import { t } from '@process-creative/slate-theme-tools';
import { 
  AjaxCollectionTemplate, SelectSorter, TagFilter, PriceRangeFilter,
  OPERATION_OR, ColorFilter, VO_MODE_VARIANT, VariantOptionFilter, 
  PageNumbers, VO_MODE_PRODUCT
} from '@process-creative/slate-ajax-collection';
import * as noUiSlider from 'nouislider';

import { ProductThumbnailPrint } from '../../objects/product/product-thumbnail-print';
import {handleExcessColorSwatches} from '../product/thumbnail-swatch-expand'

import { documentDisableScroll, documentEnableScroll } from '../../tools/layout/document'

// Custom AC Facets and Sort
import { CustomTagCheckboxFacet } from './facets/custom-tag-checkbox-facet';
import { CustomPriceRangeFacet } from './facets/custom-price-range-facet';
import { CustomColourFacet } from './facets/custom-colour-facet';
import { CustomColorFilter } from './filters/CustomColorFilter';
import { CustomSizeCheckboxFacet } from './facets/custom-size-checkbox-facet';

import {CustomSort} from './sort/CustomSort';

// Selectors
const SELECTOR_PRODUCTS_COUNT = '[data-collection-count-selector]';
const SELECTOR_NO_RESULTS = '[data-collection-no-results]';
const SELECTOR_FACETED_NAV = '[data-faceted-nav]';
const SELECTOR_FACETED_NAV_TITLE = '.c-collection-faceted-nav__title';
const SELECTOR_FACETED_NAV_GROUP = '[data-faceted-nav-group]';
const SELECTOR_CLEAR_FILTERS = '[data-clear-filters-button]';
const SELECTOR_COLLECTION_TEMPLATE = '[data-collection-template]';
const SELECTOR_PAGINATOR = '[data-other-paginator]';
const SELECTOR_OPEN_DRAWER_BUTTON = '[data-open-drawer-button]';
const SELECTOR_CLOSE_DRAWER_BUTTON = '[data-close-drawer-button]';
const SELECTOR_SORT = '[data-sort]';

// Classes
const CLASS_VISIBLE = 'is-visible';
const CLASS_EXPANDED = 'is-expanded';
const CLASS_FILTERS_VISIBLE = 'is-filters-visible';

const CLASS_PRODUCT_THUMB = 'c-collection__product o-products-list__product';

// Attrs
const ATTR_FACETED_NAV_PREFIX = 'data-faceted-nav-';


// Smart tags to generate a filter for. Each must have a matching title
// defined in the theme's language settings and a matching element to print
// the facets into.
const SMART_TAG_FILTER_PREFIXES = ["type", "sport"];
const SMART_TAG_TOKEN = '_'; // What the smart tags are separated by 

export class CollectionTemplate extends AjaxCollectionTemplate {
  constructor(container) {
    super(container);
    this.container = container;
    this.setupCollection();
    this.init();
  }

  setupCollection(){
    this.setupFiltersAndFacets();
    this.setElements();
    this.setupEvents();
  }


  setupFiltersAndFacets(){
    this.sort.addSorter(new CustomSort(this, this.container.find(SELECTOR_SORT)));

    // this.draw.setDisplayMode('AllAvailableColors');


    // Create Filters and Facets from the smart tag prefixes array
    SMART_TAG_FILTER_PREFIXES.forEach(tag => {

      let filter = new TagFilter(this, tag, OPERATION_OR);
      this.filters.addFilter(filter);
      this.filters.addFacet(
      new CustomTagCheckboxFacet({
          template: this,
          filter: filter,
          title: t(`collections.filters.facet_title_${tag}`) || tag,
          container: `[${ATTR_FACETED_NAV_PREFIX}${tag}]`,
          prefixes: [tag],
          token: SMART_TAG_TOKEN
        })
      );
    });

    let tag = 'price'
    let filter = new PriceRangeFilter(this, tag);
    this.filters.addFilter(filter);
    this.filters.addFacet(
      new CustomPriceRangeFacet({
        template: this,
        filter: filter,
        title: t(`collections.filters.facet_title_${tag}`) || tag,
        container: `[${ATTR_FACETED_NAV_PREFIX}${tag}]`,
        noUiSlider
      })
    );

    tag = 'colour';
    const colorFilter = new CustomColorFilter(this, tag, OPERATION_OR, [], VO_MODE_PRODUCT);
    this.filters.addFilter(colorFilter);
    this.filters.addFacet(
      new CustomColourFacet({
        template: this, 
        filter: colorFilter,
        type: 'color',
        title: t(`collections.filters.facet_title_${tag}`),
        optionNames: [tag, 'color'],
        container: `[${ATTR_FACETED_NAV_PREFIX}${tag}]`
      })
    );


    tag = 'size';
    const sizeFilter = new VariantOptionFilter(this, tag, OPERATION_OR, [tag, 'Size','SIZE'], VO_MODE_PRODUCT);
    this.filters.addFilter(sizeFilter);
    this.filters.addFacet(
      new CustomSizeCheckboxFacet({
        template: this,
        filter: sizeFilter,
        optionNames: [tag],
        title: t(`collections.filters.facet_title_${tag}`) || tag,
        container: `[${ATTR_FACETED_NAV_PREFIX}${tag}]`
      })
    );
  }

  setElements(){
    // Elements
    this.count = this.container.find(SELECTOR_PRODUCTS_COUNT);
    this.noResults = this.container.find(SELECTOR_NO_RESULTS);
    this.facets = this.container.find(SELECTOR_FACETED_NAV);
    this.facetToggle = [this.facets, $('body')];
    this.facetGroups = this.container.find(SELECTOR_FACETED_NAV_GROUP);
    this.pagination.setPaginator(new PageNumbers(this, this.container.find(SELECTOR_PAGINATOR)));

  }

  setupEvents(){
    // Events
    this.container.on('click', SELECTOR_OPEN_DRAWER_BUTTON, e => this.openDrawer(e));
    this.container.on('click', SELECTOR_CLOSE_DRAWER_BUTTON, e => this.closeDrawer(e));
    this.container.on('click', SELECTOR_FACETED_NAV_TITLE, e => this.onFacetToggle(e));
    this.container.on('click', SELECTOR_CLEAR_FILTERS, e => this.onClearFiltersClick(e));
    
    
    handleExcessColorSwatches(this.container[0])
  }


  

  

  generatePrint(v, index) {
    let p = v.product;

    let p2 = { ...p };//Duplicate
    p2.variants = p2.variants.map(variant => {
      let v2 = { ...variant };//Duplicate
      delete v2.product;//Remove circular reference
      return v2;
    });
    return ProductThumbnailPrint({p, p2, v, clazz: CLASS_PRODUCT_THUMB});
  }


  onFacetToggle(e) {
    e.preventDefault();
    let self = $(e.currentTarget);
    let group = self.parent(SELECTOR_FACETED_NAV_GROUP);

    if(group.hasClass(CLASS_EXPANDED)) {
      group.removeClass(CLASS_EXPANDED);
      this.clickOutsideFacet.off('click.outsideFacet');
    } else {
      this.collapseAllFacets();
      group.addClass(CLASS_EXPANDED);
      if(this.clickOutsideFacet) this.clickOutsideFacet.off('click.outsideFacet');
      this.enableClickOutsideFacet();
    }
  }

  collapseAllFacets() {
    this.facetGroups.removeClass(CLASS_EXPANDED);
  }

  enableClickOutsideFacet() {
    this.clickOutsideFacet = $(document).on('click.outsideFacet', event => {
      const clickWasOutsideFacet = event.target.closest(`${SELECTOR_FACETED_NAV_GROUP}`) == null;
      if(clickWasOutsideFacet){
        this.collapseAllFacets();
        this.clickOutsideFacet.off('click.outsideFacet');
      }
    })
  }

  onClearFiltersClick(e) {
    e.preventDefault();
    this.filters.clearFilters();
  }
  

  openDrawer(){
    this.container.addClass(CLASS_FILTERS_VISIBLE);
    documentDisableScroll();
  }
  closeDrawer(){
    this.container.removeClass(CLASS_FILTERS_VISIBLE);
    documentEnableScroll();
  }

  onVariantsDrawn(variants) {
    let unpaginatedProductCount = this.draw.unpaginatedProductCount;
    if (unpaginatedProductCount != '' || unpaginatedProductCount != undefined){
      // display number of products visible in the page count
      let message = t('collections.collection.product_count', {
        count: variants.length,
        total: unpaginatedProductCount
      });
      this.count.html(message);
    }

    if(variants.length) {
      this.noResults.removeClass(CLASS_VISIBLE);
    } else {
      this.noResults.addClass(CLASS_VISIBLE);
    }
  }
}


$(() => {
  let container = $(SELECTOR_COLLECTION_TEMPLATE);
  if(!container.length) return;
  if(container.attr('data-initialized')) return;

  //Create the template, we use window.collection for TESTING only!!
  window.collection = new CollectionTemplate(container);

});

