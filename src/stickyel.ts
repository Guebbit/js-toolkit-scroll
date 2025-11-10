import { throttle } from 'lodash';

/**
 * Emulate and extend "position: sticky"
 *
 * @param element - element to render sticky
 * @param className - class name added in "stuck mode"
 * @return function - call this function to call removeEventListener on this
 */
export default (element :HTMLElement | null, className = 'stickyel-active'): () => void => {
  // element must be present
  if(!element)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};

  // Get the window instance from the element's owner document (required for cypress tests)
  const $window = element.ownerDocument.defaultView ?? globalThis;
  // needed to check when element is back in its original position
  const initialTop = (element.getBoundingClientRect()).top + $window.scrollY;
  // helper: lessen the weight to check element status
  let isActive = false;

  // Throttle the scroll handler to improve performance
  const handleScroll = throttle(() => {
    const shouldStick = $window.scrollY >= initialTop;

    // active sticky mode: the element hit the "roof"
    if (shouldStick && !isActive) {
      isActive = true;
      element.style.position = 'fixed';
      element.style.top = '0';
      element.classList.add(className);
      // remove sticky mode: element is fixed on top and the initial scroll position reached the window scroll
    } else if (!shouldStick && isActive) {
      isActive = false;
      element.style.removeProperty('position');
      element.style.removeProperty('top');
      element.classList.remove(className);
    }
  }, 20, { leading: true });

  // add the event...
  $window.addEventListener('scroll', handleScroll);
  // ... and remove it later calling the returned function
  return () => {
    $window.removeEventListener('scroll', handleScroll);
  };
};
