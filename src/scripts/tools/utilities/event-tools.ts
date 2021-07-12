/**
 * This callback is displayed as a global member.
 * @callback eventCallback
 * @param {object} event Event callback
 * @param {HTMLElement} target Event target
 */

/**
 * Properties for delegating events
 * @typedef {Object} DelegateParams
 * @property {HTMLElement} element - Element to attach the event listener to
 * @property {string} event Event to listen for
 * @property {string} selector Selector to listen for events on
 * @property {eventCallback} callback Event Callback Function
 */
interface DelegateParams<K extends keyof HTMLElementEventMap, E extends HTMLElement> {
  element:HTMLElement|string;
  selector:string;
  callback:(event:HTMLElementEventMap[K], target:E)=>any
  event:K;
};


/**
 * Attaches an event listener to an ancestor node to listen for events on the
 * children nodes.
 *
 * @param {DelegateParams} params Information about the event listener
 * @returns {void} A function to remove the attached event listener
 */
export const delegate = <K extends keyof HTMLElementEventMap, E extends HTMLElement>(params:DelegateParams<K,E>) => {
  const { element, selector, event, callback } = params;

  const internalCallback = (event:HTMLElementEventMap[K]) => {
    if(!event.target ||
      !(event.target instanceof HTMLElement || event.target instanceof SVGElement) ||
      typeof event.target['matches'] === typeof undefined
    ) return;

    let target = event.target.matches(selector) ? event.target as E : (
      event.target.closest<E>(selector)
    );
    if(!target) return;
    callback(event, target);
  };

  let elem = typeof element === 'string' ? (
    document.querySelector<E>(element)
  ) : element;
  if(!elem) return null;

  elem.addEventListener(event, internalCallback);
  return () => elem && elem.removeEventListener(event, internalCallback);
};

/**
 *
 * @param {Event} e - Event to find target from
 * @param {string} selector - Selector string to find target with
 */
export const findTarget = (e:Event, selector:string) => {
  if(!e.target ||
    !(e.target instanceof HTMLElement || e.target instanceof SVGElement) ||
    typeof e.target['matches'] === typeof undefined
  ) return;

  const target = e.target.matches(selector) ? e.target as HTMLElement : (
    e.target.closest<HTMLElement>(selector)
  );
  return target;
}