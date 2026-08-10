import { type IScrollOptions, onFrame } from './onFrame';

/**
 * Emulate and extend "position: sticky"
 *
 * @param element - element to render sticky
 * @param className - class name added in "stuck mode"
 * @param settings - rate-limit strategy for the scroll handler
 * @return function - call this function to call removeEventListener on this
 */
export const stickyel = (element :HTMLElement | null, className = 'stickyel-active', settings: IScrollOptions = {}): () => void => {
  // element must be present
  if(!element)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};

  const { wrap = onFrame } = settings;

  // Get the window instance from the element's owner document (required for cypress tests)
  const $window = element.ownerDocument.defaultView ?? globalThis;
  // needed to check when element is back in its original position
  let initialTop = 0;
  // helper: lessen the weight to check element status
  // Equivalent-mutant note: seeding this true changes nothing, because the
  // first measure() releases before it reads, and releasing an element that was
  // never pinned removes properties and a class it does not have.
  let isActive = false;

  const release = () => {
    isActive = false;
    element.style.removeProperty('position');
    element.style.removeProperty('top');
    element.classList.remove(className);
  };

  const update = () => {
    const shouldStick = $window.scrollY >= initialTop;

    // active sticky mode: the element hit the "roof"
    if (shouldStick && !isActive) {
      isActive = true;
      element.style.position = 'fixed';
      element.style.top = '0';
      element.classList.add(className);
      // remove sticky mode: element is fixed on top and the initial scroll position reached the window scroll
    } else if (!shouldStick && isActive) {
      release();
    }
  };

  /**
   * The resting position can only be read while the element is still in the
   * document flow: once pinned it reports where it was moved to, not where it
   * came from. So a pinned element is released first and re-pinned by the
   * update that follows, both before the browser paints.
   */
  const measure = () => {
    // Put the element back in the flow before reading where the flow puts it.
    // Releasing one that was never pinned removes properties and a class it
    // does not have, so this needs no guard.
    release();
    initialTop = (element.getBoundingClientRect()).top + $window.scrollY;
    update();
  };

  measure();

  const handleScroll = wrap(update);
  // Anything that reflows the page moves the resting position: a rotated
  // phone, a collapsed banner, a font that finished loading. Measuring only
  // once leaves the element pinning at a position that no longer exists.
  const handleResize = wrap(measure);

  // add the events...
  $window.addEventListener('scroll', handleScroll);
  $window.addEventListener('resize', handleResize);
  // ... and remove them later calling the returned function
  return () => {
    $window.removeEventListener('scroll', handleScroll);
    $window.removeEventListener('resize', handleResize);
    // A run queued but not yet made would otherwise still touch an element the
    // caller has already finished with.
    handleScroll.cancel?.();
    handleResize.cancel?.();
  };
};
