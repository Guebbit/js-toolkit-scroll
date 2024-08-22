export interface IIntersectionSettings {
    /**
     * IntersectionObserver native
     * It's the viewport that checks the visibility of the element.
     * It's a "fixed" section that determine as "intersecting" the elements that enter in it.
     * Default is entire viewport (as soon as the user see the element)
     */
    root?: Element;
    /**
     * IntersectionObserver native
     * Is like adding extra space around the root, can go beyond the viewport.
     * It is needed to start checking visibility a bit before the element actually enters the root or a bit after it leaves.
     * Useful if we want to lazyload images well before they appear on the user viewport.
     */
    rootMargin?: string;
    /**
     * IntersectionObserver native
     * It's the % of visibly element within the "fixed" section that is "root".
     * 1 means trigger only when the entire element is completely visible.
     * 0.5 means trigger when at least 50% is visible
     * 0 means trigger as soon as any part of the element is visible.
     */
    threshold?: number;
    single?: boolean;
    intersectingCallback?: (el: Element) => void;
    notIntersectingCallback?: (el: Element) => void;
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
declare const setIntersection: (elements: NodeListOf<Element> | null, settings?: IIntersectionSettings) => IntersectionObserver | false;
/**
 *
 * @param elements
 * @param activeClass
 * @param mobileOnlyClass
 * @param threshold
 */
export declare const activateIntersection: (elements?: NodeListOf<Element>, activeClass?: string, mobileOnlyClass?: string, threshold?: number) => false | IntersectionObserver;
/**
 *
 * @param elements
 * @param activeClass
 * @param mobileOnlyClass
 * @param threshold
 */
export declare const activateIntersectionOnce: (elements?: NodeListOf<Element>, activeClass?: string, mobileOnlyClass?: string, threshold?: number) => false | IntersectionObserver;
export default setIntersection;
