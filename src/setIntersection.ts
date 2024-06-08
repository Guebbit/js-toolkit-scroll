import formatNodeList from "./formatNodeList";

export interface IIntersectionSettings {
  single?: boolean,
  root?: Element,
  rootMargin?: string,
  threshold?: number,
  intersectingCallback?: (el: Element) => void,
  notIntersectingCallback?: (el: Element) => void
}

/**
 * IntersectionObserver helper, for better coding
 *
 * @param element - target element
 * @param settings
 * @param $window - window object, necessary in some cases (like E2E tests)
 */
export default (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, settings: IIntersectionSettings = {}, $window :Window = window): IntersectionObserver | false => {	//:NodeListOf<Element>
  let i: number;
  const {
      single = false,
      root = null,
      rootMargin = "0px",
      threshold = 0,
      intersectingCallback,
      notIntersectingCallback
    } = settings,
    elementsArray = formatNodeList(element);

  //FALLBACK in case IntersectionObserver doesn't exist
  if (!("IntersectionObserver" in $window)) {
    for (i = elementsArray.length; i--;)
      if (intersectingCallback && elementsArray[i])
        intersectingCallback(elementsArray[i]!);
    return false;
  }

  const observer: IntersectionObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[], self: IntersectionObserver) => {
      for (i = entries.length; i--;) {
        if (!entries[i])
          continue;
        const {target, isIntersecting} = entries[i]!;
        if (isIntersecting) {
          // Interrompo i monouso quando hanno successo la 1° volta
          if (intersectingCallback && single)
            self.unobserve(target);
        } else {
          //NON sta intersecando
          if (notIntersectingCallback)
            notIntersectingCallback(target);
        }
      }
    }, {
      root,
      rootMargin,
      threshold,
    });

  for (i = elementsArray.length; i--;)
    if (elementsArray[i])
      observer.observe(elementsArray[i]!);

  return observer;
};
