import { type IScrollHandlerWrapper, onFrame } from './onFrame';

export interface IShyelSettings {
  // how much go back on top (auto = element calculated height)
  // can be needed in special cases
  elementHeight?: number | string,
  // how much intensity of scroll does trigger the shy (hide) effect
  intensity?: number,
  // class that applies when stick to the top
  classShow?: string
  // class that applies when hide
  classHide?: string
  /**
   * Rate-limit strategy for the scroll handler.
   * Defaults to one run per animation frame. Pass your own to choose different
   * timings, for example lodash's throttle or debounce.
   */
  wrap?: IScrollHandlerWrapper
}

/**
 * Header (recommended)  that hide or show based on user scroll movements.
 *
 * @param element - the element that is gonna hide or show
 * @param threshold - threshold activation for hiding. After how much we activate hide function
 * @param settings - some settings to customize the stickyness
 * @return function - call this function to call removeEventListener on this
 */
export const shyel = (element: HTMLElement | null, threshold = 0, settings: IShyelSettings = {}) :() => void => {
  if (!element)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};

  // settings
  const {
    elementHeight = 'auto',
    intensity = 0,
    classShow = 'shyel-show',
    classHide = 'shyel-hide',
    wrap = onFrame,
  } = settings;

  // Get the window instance from the element's owner document (required for cypress tests)
  const $window = element.ownerDocument.defaultView ?? globalThis;
  // determine height if not specified (should never be specified)
  let hideTop = 0;
  // record last scroll position, to determine the direction of the next, and to check intensity
  let lastScrollY = 0;

  const measure = () => {
    hideTop = elementHeight === 'auto' ? element.offsetHeight + 1 : elementHeight as number;
    // A hidden header is already sitting at the old offset. Leaving it there
    // after the height changes shows a strip of it, or hides too much.
    if (hideTop != 0 && element.classList.contains(classHide))
      element.style.top = -hideTop + 'px';
  };

  measure();

  const update = () :void => {
    // scroll of window
    const scrollY = $window.scrollY;

    // WARNING: if on top of page (10px?) DO NOT hide. Bugs can occur.
    if (scrollY < 10)
      return;

    // if we are under scroll threshold, do not apply (and remove if any) shyness
    if (scrollY < threshold) {
      // Equivalent-mutant note: dropping this guard changes nothing here,
      // because clearing an already-empty top is a no-op. It earns its place
      // only on the hide branch, where elementHeight 0 must not write an offset.
      if (hideTop != 0)
        element.style.top = '';
      element.classList.remove(classHide);
      element.classList.add(classShow);
      return;
    }

    // if the intensity isn't enough, don't change.
    if (Math.abs(scrollY - lastScrollY) < intensity)
      return;

    // Detect scroll direction
    if (scrollY >= lastScrollY) {
      // Towards Bottom
      // add shy mode: hide header, and apply class (if any)
      if (hideTop != 0)
        element.style.top = -hideTop + 'px';
      element.classList.add(classHide);
      element.classList.remove(classShow);
    } else {
      // Towards Top
      // remove shy mode: when scrolling top, header need to reappear, and apply class (if any)
      // Equivalent-mutant note: as above, clearing an already-empty top is a no-op.
      if (hideTop != 0)
        element.style.top = '';
      element.classList.remove(classHide);
      element.classList.add(classShow);
    }

    // save last scroll
    lastScrollY = scrollY;
  };

  const handleScroll = wrap(update);
  // A header that shrinks on scroll, or a viewport that rotates, changes how
  // far the element has to travel. Measuring only once leaves it hiding by the
  // wrong amount for the rest of the page's life.
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
