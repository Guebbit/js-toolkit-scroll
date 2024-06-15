/**
 * Set lazyload on <source> tag
 * Updates src and srcset to data-src and data-srcset, then remove the original attributes.
 * Tell me if changes were made
 * @param element
 */
export declare const setLazyloadAttributes: (element: Element) => boolean;
/**
 * Set lazyload to <video>
 * @param video
 */
export declare const setLazyloadLoadVideo: (video: HTMLVideoElement) => Promise<boolean>;
/**
 * Set lazyload to <video> tag and it's <source>s
 * @param video
 */
export declare const setLazyloadApplyToVideo: (video: HTMLVideoElement) => boolean;
/**
 * Set lazyload to <img>
 * @param element
 */
export declare const setLazyloadApplyToImage: (element: HTMLImageElement) => boolean;
/**
 * Set lazyload to <source> of <img>
 * @param element
 */
export declare const setLazyloadApplyToSource: (element: HTMLSourceElement) => boolean;
/**
 * Set lazyload to targeted element
 * @param element
 */
export default function (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null): void;
//# sourceMappingURL=setLazyload.d.ts.map