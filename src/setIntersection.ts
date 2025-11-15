import { debounce } from 'lodash';

export interface IIntersectionSettings {
  /**
   * IntersectionObserver native
   * It's the viewport that checks the visibility of the element.
   * It's a "fixed" section that determine as "intersecting" the elements that enter in it.
   * Default is entire viewport (as soon as the user see the element)
   */
  root?: Element,
  /**
   * IntersectionObserver native
   * Is like adding extra space around the root, can go beyond the viewport.
   * It is needed to start checking visibility a bit before the element actually enters the root or a bit after it leaves.
   * Useful if we want to lazyload images well before they appear on the user viewport.
   */
  rootMargin?: string,
  /**
   * IntersectionObserver native
   * It's the % of visibly element within the "fixed" section that is "root".
   * 1 means trigger only when the entire element is completely visible.
   * 0.5 means trigger when at least 50% is visible
   * 0 means trigger as soon as any part of the element is visible.
   */
  threshold?: number,
  // single use, remove the observer when the intersection happen
  single?: boolean,
  // callbacks for when the intersection happen
  intersectingCallback?: (element: Element) => void,
  notIntersectingCallback?: (element: Element) => void
}

/**
 * IntersectionObserver helper, for better coding
 *
 *
 * @param elements - target elements
 * @param settings
 * @return observer element - to be later removed with:
 *     for (i = elements.length; i--;)
 *       if (elements[i])
 *         observer.unobserve(elements[i]);
 */
export const setIntersection = (elements: NodeListOf<Element> | Element[] | null, settings: IIntersectionSettings = {}): IntersectionObserver | false => {
  if(!elements)
    return false;

  let i: number;
  const {
      single = false,
      root = undefined,
      rootMargin = "0px",
      threshold = 0,
      intersectingCallback,
      notIntersectingCallback
    } = settings;


  //FALLBACK in case IntersectionObserver doesn't exist
  if (!("IntersectionObserver" in globalThis)) {
    for (i = elements.length; i--;)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (intersectingCallback && elements[i])
        intersectingCallback(elements[i]);
    return false;
  }

  /**
   * The observer that will be
   */
  const observer: IntersectionObserver = new IntersectionObserver(
    debounce((entries: IntersectionObserverEntry[], self: IntersectionObserver) => {
      for (i = entries.length; i--;) {
        if (!entries[i])
          continue;
        const { target, isIntersecting } = entries[i];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if(!target)
          continue;

        if (isIntersecting) {
          // if single time use: remove observer
          if (intersectingCallback && single)
            self.unobserve(target);
          if(intersectingCallback)
            intersectingCallback(target);
        } else {
          // it isn't intersecting
          if (notIntersectingCallback)
            notIntersectingCallback(target);
        }
      }
    }, 10), {
      root,
      rootMargin,
      threshold,
    });

  // add observer
  for (i = elements.length; i--;)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (elements[i])
      observer.observe(elements[i]);

  return observer;
};

/**
 *
 * @param elements
 * @param activeClass
 * @param mobileOnlyClass
 * @param threshold
 */
export const activateIntersection = (elements = document.querySelectorAll('.observer-activate'), activeClass = 'active', mobileOnlyClass = 'observer-mobile-only', threshold = 1) =>
  setIntersection(elements, {
    threshold,
    intersectingCallback: function(entry) {
      // mobile only
      if (entry.classList.contains(mobileOnlyClass) && !globalThis.matchMedia("(max-width: 600px)").matches)
        return false;
      // intersect
      entry.classList.add(activeClass);
      return true;
    },
    notIntersectingCallback: function(entry) {
      // mobile only
      if (entry.classList.contains(mobileOnlyClass) && !globalThis.matchMedia("(max-width: 600px)").matches)
        return false;
      // intersection end
      entry.classList.remove(activeClass);
      return true;
    }
  });

/**
 *
 * @param elements
 * @param activeClass
 * @param mobileOnlyClass
 * @param threshold
 */
export const activateIntersectionOnce = (elements = document.querySelectorAll('.observer-activate-once'), activeClass = 'active', mobileOnlyClass = 'observer-mobile-only', threshold = 1) =>
  setIntersection(elements, {
    threshold,
    intersectingCallback: function(entry) {
      if (entry.classList.contains(mobileOnlyClass) && !globalThis.matchMedia("(max-width: 600px)").matches)
        return false;
      entry.classList.add(activeClass);
      return true;
    },
  });
