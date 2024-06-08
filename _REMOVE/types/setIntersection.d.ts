export interface IIntersectionSettings {
    single?: boolean;
    root?: Element;
    rootMargin?: string;
    threshold?: number;
    intersectingCallback?: (el: Element) => void;
    notIntersectingCallback?: (el: Element) => void;
}
/**
 * IntersectionObserver helper, for better coding
 *
 * @param element - target element
 * @param settings
 * @param $window - window object, necessary in some cases (like E2E tests)
 */
declare const _default: (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, settings?: IIntersectionSettings, $window?: Window) => IntersectionObserver | false;
export default _default;
//# sourceMappingURL=setIntersection.d.ts.map