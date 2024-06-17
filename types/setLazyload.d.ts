/**
 * Set lazyload on <source> tag
 * Updates src and srcset to data-src and data-srcset, then remove the original attributes.
 * Tell me if changes were made
 * @param element
 * @param prefix - data-src by default
 */
export declare const setLazyAttributes: (element: Element, prefix?: string) => boolean;
/**
 * Set lazyload to <video> tag and it's <source>s
 *
 * @param video
 * @param loadedClass
 */
export declare const applyLazyVideo: (video: HTMLVideoElement, loadedClass?: string) => boolean;
/**
 * Set lazyload to <picture> tag and it's <source>s
 * There could be an <img> fallback
 *
 * @param image
 * @param loadedClass
 */
export declare const applyLazyPicture: (image: HTMLPictureElement, loadedClass?: string) => boolean;
/**
 * Set lazyload to <img>
 * @param element
 * @param loadedClass
 */
export declare const applyLazyImage: (element: HTMLImageElement, loadedClass?: string) => boolean;
/**
 * Setup lazyload in the selected elements
 *
 * @param elements
 */
declare const setLazyload: (elements: NodeListOf<Element> | Element[] | null) => void;
/**
 * Automatic lazyload apply
 *
 * @param elements
 * @param forcedElements
 */
export declare const activateLazyload: (elements?: NodeListOf<Element>, forcedElements?: NodeListOf<Element>) => false | IntersectionObserver;
export default setLazyload;
//# sourceMappingURL=setLazyload.d.ts.map