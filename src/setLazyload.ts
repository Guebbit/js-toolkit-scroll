import { setIntersection } from './index';

/**
 * Set lazyload on <source> tag
 * Updates src and srcset to data-src and data-srcset, then remove the original attributes.
 * Tell me if changes were made
 * @param element
 * @param prefix - data-src by default
 */
export const setLazyAttributes = function(element: Element, prefix = 'data-'): boolean {
  let flag = false;
  if (element.hasAttribute(prefix + 'src')) {
    element.setAttribute('src', (element.getAttribute(prefix + 'src')!));
    element.removeAttribute(prefix + 'src');
    flag = true;
  }
  if (element.hasAttribute(prefix + 'srcset')) {
    element.setAttribute('srcset', (element.getAttribute(prefix + 'srcset')!));
    element.removeAttribute(prefix + 'srcset');
    flag = true;
  }
  return flag;
};

/**
 * Set lazyload to <video> tag and it's <source>s
 *
 * @param video
 * @param loadedClass
 * @param prefix - the attribute prefix holding the deferred sources
 */
export const applyLazyVideo = function(video: HTMLVideoElement, loadedClass = 'loaded', prefix = 'data-'): boolean {
  if (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2)
    return true;
  if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return false;
  // apply to video...
  setLazyAttributes(video, prefix);
  video.addEventListener('loadeddata', function() {
    (this).classList.add(loadedClass);
  });
  video.load();
  // ...and to its sources
  const sourceElements = video.querySelectorAll('source');
  for (let i = sourceElements.length; i--;)
    setLazyAttributes(sourceElements[i], prefix);
  return true;
};

/**
 * Set lazyload to <picture> tag and it's <source>s
 * There could be an <img> fallback
 *
 * @param image
 * @param loadedClass
 * @param prefix - the attribute prefix holding the deferred sources
 */
export const applyLazyPicture = function(image: HTMLPictureElement, loadedClass = 'loaded', prefix = 'data-'): boolean {
  setLazyAttributes(image, prefix);
  // A <picture> never loads anything itself and the load event of its inner
  // <img> does not bubble, so the listener has to sit on the <img>. The class
  // still lands on the <picture>, which is the element the caller holds.
  const fallbackImages = image.querySelectorAll('img');
  for (let i = fallbackImages.length; i--;)
    fallbackImages[i].addEventListener('load', function() {
      image.classList.add(loadedClass);
    });
  // apply to sources
  const sourceElements = image.querySelectorAll('source, img');
  for (let i = sourceElements.length; i--;)
    setLazyAttributes(sourceElements[i], prefix);
  return true;
};

/**
 * Set lazyload to <img>
 * @param element
 * @param loadedClass
 * @param prefix - the attribute prefix holding the deferred sources
 */
export const applyLazyImage = function(element: HTMLImageElement, loadedClass = 'loaded', prefix = 'data-'): boolean {
  if (!setLazyAttributes(element, prefix))
    return false;
  element.addEventListener('load', function() {
    (this as HTMLElement).classList.add(loadedClass);
  });
  return true;
};

/**
 * Setup lazyload in the selected elements
 *
 * @param elements
 */
export const setLazyload = (elements: NodeListOf<Element> | Element[] | null, prefix = 'data-') => {
  if (!elements)
    return;

  for (let i = elements.length; i--;)
    if (elements[i])
      switch (elements[i].tagName) {
        case 'IMG': {
          applyLazyImage(elements[i] as HTMLImageElement, 'loaded', prefix);
          break;
        }
        // no need because PICTURE and VIDEO gets all
        // case "SOURCE":
        //   setLazyAttributes(elements[i] as HTMLSourceElement);
        //   break;
        // Inside PICTURE there can be a fallback IMG, but it's already taken care of
        case 'PICTURE': {
          applyLazyPicture(elements[i] as HTMLPictureElement, 'loaded', prefix);
          break;
        }
        case 'VIDEO': {
          applyLazyVideo(elements[i] as HTMLVideoElement, 'loaded', prefix);
          break;
        }
      }
};

/**
 * Automatic lazyload apply
 *
 * @param elements
 * @param forcedElements
 */
export const activateLazyload = (
  elements: NodeListOf<Element> | Element[] = document.querySelectorAll('img:not(.lazyload-forced), video:not(.lazyload-forced), picture:not(.lazyload-forced)'),
  forcedElements: NodeListOf<Element> | Element[] = document.querySelectorAll('.lazyload-forced'),
  prefix = 'data-'
) => {
  // first all element that have to be forcibly lazyloaded
  setLazyload(forcedElements, prefix);
  // then the observer for the regular scroll-to-lazyload items
  return setIntersection(elements, {
    rootMargin: '500px 0px',	// load the image 500px before entering the viewport (0px on the Y axis)
    single: true,				      // lazyload is one-hit so there is no need for the observer to keep watch
    intersectingCallback: function(entry: Element) {
      setLazyload([entry], prefix);
    }
  });
};
