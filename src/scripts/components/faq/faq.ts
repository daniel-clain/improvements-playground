
import { CLASS_HIDDEN } from './../../tools/constants/classes';
import { initAccordion, closeAccordion } from './../../components/accordion';
import { t } from '@process-creative/slate-theme-tools';

const SELECTOR_ACCORDION = '[data-faq-accordion]';
const SELECTOR_ANSWER = '[data-answer-expand]';
const SELECTOR_ANSWER_CONTAINER = '[data-answer]';
const SELECTOR_ACCORDION_TITLE = '[data-accordion-title]';

document.querySelectorAll<HTMLElement>(SELECTOR_ACCORDION).forEach(containerElement => {
  const answerGroup = containerElement.querySelectorAll<HTMLElement>(SELECTOR_ANSWER);
  const titleGroup = containerElement.querySelectorAll<HTMLElement>(SELECTOR_ACCORDION_TITLE);
  const answers = containerElement.querySelectorAll<HTMLElement>(SELECTOR_ANSWER_CONTAINER);
  
  const closeAllAnswers = () => {
    if (answers) {
      answers.forEach(el => {
        el.classList.add(CLASS_HIDDEN);
        if (el.nextElementSibling) el.nextElementSibling.innerHTML = t('faq.answer.show');
      });
    }
  }

  if (containerElement) {
    initAccordion(containerElement);
    closeAccordion(containerElement);
  }

  // Add click events to each answer expand link
  answerGroup.forEach(answer => {
    if (!answer) return;

    answer.addEventListener('click', e => {
      e.preventDefault();

      const el = e.target as HTMLElement;
      const answerContainer = el.previousElementSibling;
      if (!el || !answerContainer) return;

      if (answerContainer.classList.contains(CLASS_HIDDEN)) {
        closeAllAnswers();
      }

      // Change answer expand text
      el.innerHTML = 
        answerContainer.classList.contains(CLASS_HIDDEN)
          ? t('faq.answer.hide')
          : t('faq.answer.show');

      answerContainer.classList.toggle(CLASS_HIDDEN);
    });
  });

  // Close answers on accordion change
  titleGroup.forEach(title => {
    if (!title) return;

    title.addEventListener('click', e => {
      closeAllAnswers();
    });
  })
});