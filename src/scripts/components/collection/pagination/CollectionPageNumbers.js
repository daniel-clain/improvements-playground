/*
 *  Collection Page Numbers
 *    Extends the ajax collection page numbers to add some additional functionality
 *
 *  Version:
 *    1.0.0 - 2020/10/02
 */
import { PageNumbers } from '@process-creative/slate-ajax-collection';
import { CLASS_HIDDEN } from '../../../tools/constants/classes';

const SELECTOR_NEXT_BUTTON = '[data-collection-next-button]'

export class CollectionPageNumbers extends PageNumbers {
  constructor(template, container) {
    super(template, container);

    this.customNextButton = $(SELECTOR_NEXT_BUTTON);
    this.customNextButton.on('click touchend', e => this.onNextPaginationClick(e));
  }

  onPageChange() {
    super.onPageChange();
    let top = $('[data-collection-template-products]').offset().top;
    $('html,body').animate({ scrollTop: top});
  }

  redraw() {
    super.redraw();
    if(this.pagination.getCurrentPage() >= this.pagination.getTotalPages()) {
      this.customNextButton.addClass(CLASS_HIDDEN);
    } else {
      this.customNextButton.removeClass(CLASS_HIDDEN);
    }
  }

  onNextPaginationClick(e) {
    this.onNextClick();
  }
}