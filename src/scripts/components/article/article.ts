/*
 *  Article
 *
 *  Version:
 *    1.0.0 - 2021/04/28
 */

// Selectors
const ARTICLE_SELECTOR = '[data-article-selector]';
const ARTICLE_CONTENT_SELECTOR = '[data-article-content-selector]';
const ARTICLE_SCROLL_SELECTOR = '[data-article-scroll-selector]';
const ARTICLE_SHARE_SELECTOR = '[data-article-share-selector]';
const HEADER_SELECTOR = '[data-header]';

// Classes
const RESPONSIVE_IMAGE = 'o-responsive-image';
const RESPONSIVE_IMAGE_CONTAINER = 'o-responsive-image__container';
const IS_IFRAME = 'is-iframe';

const removePTagFromImages = function (container: HTMLElement) {
  const selector = 'p > img, div > img, p > .c-article-template__video-content';
  const content = container.querySelector(ARTICLE_CONTENT_SELECTOR);

  // Unwrap element
  content?.querySelectorAll(selector).forEach(element => {
    let parent = element.parentElement;
    if (parent) {
      parent.outerHTML = parent.innerHTML;
    }
  });
}

const mobileShare = function (container: HTMLElement) {
  container.querySelector(ARTICLE_SHARE_SELECTOR)?.addEventListener('click', e => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: document.URL,
      });
    } else {
      // No native share fallback
      const dummy = document.createElement('input');
      const text = document.title + ' - ' + document.URL;

      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
    }

    const el = <Element>e.currentTarget;
    el.parentElement?.classList.add('is-selected');

    setInterval(e => {
      el.parentElement?.classList.remove('is-selected');
    }, 5000);
  });
}

const articleScroll = function (container: HTMLElement) {
  container.querySelector(ARTICLE_SCROLL_SELECTOR)?.addEventListener('click', e => {
    e.preventDefault();

    const scrollTarget = container.querySelector(ARTICLE_CONTENT_SELECTOR);
    const header = document.querySelector(HEADER_SELECTOR);

    if (!scrollTarget || !header) return null;

    const offset = scrollTarget.getBoundingClientRect().top + window.scrollY
      - header.getBoundingClientRect().height;

    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
}

document.querySelectorAll<HTMLElement>(ARTICLE_SELECTOR).forEach((article) => {
  removePTagFromImages(article);
  mobileShare(article);
  articleScroll(article);
});